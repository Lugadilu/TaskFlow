using System;

namespace TaskFlowAPI.Models;

public class ResetPasswordRequest
{
    // Token from the reset link (query string)
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
