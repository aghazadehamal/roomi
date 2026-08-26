export function authErrorMessage(error: { message: string; code?: string }): string {
  const text = error.message.toLowerCase();

  if (text.includes("fetch failed") || text.includes("failed to fetch")) {
    return "Supabase-ə qoşulmaq mümkün olmadı. İnterneti yoxla, .env.local-də URL və açarı yoxla, sonra npm run dev-i yenidən işə sal.";
  }
  if (text.includes("invalid login") || text.includes("invalid credentials")) {
    return "Email və ya şifrə yanlışdır.";
  }
  if (text.includes("already registered") || error.code === "user_already_exists") {
    return "Bu email artıq qeydiyyatdan keçib. Giriş et.";
  }
  if (text.includes("database error saving new user")) {
    return "Profil yaradıla bilmədi. SQL Editor-də profile_trigger faylını Run et.";
  }
  if (text.includes("invalid api key") || text.includes("invalid jwt") || text.includes("malformed")) {
    return "Açar uyğun gəlmir. API Keys → Legacy anon (eyJ...) açarını .env.local-ə yaz.";
  }
  if (text.includes("email rate limit") || text.includes("over_email_send_rate_limit")) {
    return "Təsdiq məktubu limiti dolub. Bir saat gözlə, və ya Authentication → Email → Confirm email-i söndür, sonra Giriş et.";
  }
  if (text.includes("email not confirmed")) {
    return "Email təsdiqlənməyib. Authentication-da Confirm email-i söndür, və ya Users-də Confirm user bas.";
  }
  if (text.includes("password should be") || text.includes("password is known")) {
    return "Şifrə zəifdir. Daha uzun və qarışıq şifrə yaz.";
  }

  return error.message;
}
