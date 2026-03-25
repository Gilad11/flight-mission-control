var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5174");
var app = builder.Build();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
app.Run();
