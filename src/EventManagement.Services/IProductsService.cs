using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IProductsService
	{
		Task<List<Product>> GetAsync();
		Task<List<Product>> GetForEventAsync(int eventId);
		Task<List<ApplicationUser>> GetUsersByProduct(int productId);
	}
}
