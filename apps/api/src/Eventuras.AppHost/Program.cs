var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume();

var db = postgres.AddDatabase("DefaultConnection", databaseName: "eventuras");

builder.AddProject<Projects.Eventuras_WebApi>("api")
    .WithReference(db)
    .WaitFor(db);

builder.Build().Run();
