namespace Eventuras.Services.Users
{
    public class UserListRequest : PagingRequest
    {
        public UserFilter Filter { get; set; } = new UserFilter();

        public UserListOrder OrderBy { get; set; } = UserListOrder.Name;

        public bool Descending { get; set; }
    }
}
