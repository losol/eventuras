using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Orders
{
    public class OrderUpdateException : ServiceException
    {
        public OrderUpdateException(string message) : base(message)
        {
        }
    }
}
