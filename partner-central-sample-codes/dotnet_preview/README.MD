## Testing .NET SDK Preview Builds
1. Install the .NET SDK
The shared example project uses .NET 8.0, but you can use another version that you prefer. Please install the needed SDK
from this page: https://dotnet.microsoft.com/en-us/download
2. Install AWSSDK packages with NuGet: https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/net-dg-install-assemblies.html
   dotnet add package AWSSDK.PartnerCentralSelling
3. Update configuration if using .NET other than .NET 8.0
   1. Open `.csproj` file in each directory
   2. Update `Reference` records under the `ItemGroup` to use the correct .NET version you need 
   3. You may need to update the code when using a different .NET version
4. Configure authentication
5. Run `dotnet add package Newtonsoft.Json` to install Json.NET library.
6. To add your own sample use case, create a new folder under src, i.e. CreateOpportunity, cd CreateOpportunity. Run `dotnet new console`
7. To run the code: `dotnet run --project src/GetOpportunity/GetOpportunity.csproj`
The example project includes BasicAWSCredentials that you can populate with you credentials. It also includes SharedCredentialsFile to read credentials from your credentials file.
Follow this guide https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/creds-idc.html to configure SDK authentication.
