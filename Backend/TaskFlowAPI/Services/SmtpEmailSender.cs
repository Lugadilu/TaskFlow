using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;

namespace TaskFlowAPI.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _config;
    
    public SmtpEmailSender(IConfiguration config)
    {
        _config = config;
    }

     public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
       {
           var host = _config["Email:SmtpHost"];
           var port = _config.GetValue<int>("Email:SmtpPort", 587);
           var user = _config["Email:Username"];
           var password = _config["Email:Password"];
           var fromAddress = _config["Email:FromAddress"] ?? user;
           var fromName = _config["Email:FromName"] ?? "TaskFlow";

           if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(password))
           {
               throw new InvalidOperationException("Email is not configured. Set Email:SmtpHost, Email:Username, Email:Password in appsettings.json.");
           }

           var message = new MimeMessage();
           message.From.Add(new MailboxAddress(fromName, fromAddress));
           message.To.Add(MailboxAddress.Parse(toEmail));
           message.Subject = subject;
           message.Body = new TextPart("html") { Text = htmlBody };

           using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, cancellationToken);
           await client.AuthenticateAsync(user, password, cancellationToken);
           await client.SendAsync(message, cancellationToken);
           await client.DisconnectAsync(true, cancellationToken);
       }
}
