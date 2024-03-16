namespace Eventuras.WebApi.Models;

public class OnlineCourseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Slug { get; set; }
    public bool Featured { get; set; }
    public bool OnDemand { get; set; }
}
