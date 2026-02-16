using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;
using TaskFlowAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskFlowAPI.Services;
using System.Security.Cryptography;


namespace TaskFlowAPI.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;  // Add this
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender; // Add this

        // Constructor with both dependencies
        public AuthController(AppDbContext context, IConfiguration config, IEmailSender emailSender)
        {
            _context = context;
            _config = config;
            _emailSender = emailSender;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (existingUser != null)
            {
                return BadRequest(new { message = "User already exists" });
            }
            
            // Create new user with hashed password
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            
            // 2. Check if user exists
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }
            
            // 3. Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }
            
            // 4. Generate JWT token
            var token = GenerateJwtToken(user);
            
            return Ok(new { token });

        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // Security: do not reveal whether the email exists
            if (user == null)
            {
                return Ok(new { message = "If an account exists for this email, you will receive a reset link." });
            }

            // Generate a random token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(tokenBytes);

            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            //prints out the token to the console for testing purposes. In production, you would remove this and rely solely on email delivery.
            Console.WriteLine("========================================");
            Console.WriteLine($"DEBUG: Token for {request.Email} is:");
            Console.WriteLine(token);
            Console.WriteLine("========================================");

            user.PasswordResetToken = token;

            await _context.SaveChangesAsync();

            // Build reset URL pointing to your React app
            var baseUrl = _config["App:FrontendBaseUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
            var resetLink = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";

            var subject = "TaskFlow – Reset your password";
            var body = $@"
                <p>Hi {user.Username},</p>
                <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
                <p><a href=""{resetLink}"">Reset password</a></p>
                <p>If you didn't request this, you can ignore this email.</p>
            ";

            await _emailSender.SendEmailAsync(user.Email, subject, body);

            return Ok(new { message = "If an account exists for this email, you will receive a reset link." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Token and new password are required." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.Token &&
                u.PasswordResetTokenExpiry != null &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid or expired reset link. Request a new one." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password has been reset. You can sign in with your new password." });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is not configured");
            }
            
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username)
            };
            
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}