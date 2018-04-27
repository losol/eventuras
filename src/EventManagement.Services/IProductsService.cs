using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IProductsService
	{
		Task<List<Product>> GetAsync();
		Task<Product> GetAsync(int id);

		Task<List<Product>> GetForEventAsync(int eventId);
		Task<List<Registration>> GetRegistrationsAsync(int productId);

		Task<bool> UpdateProductAsync(int productId, bool published);
		Task<bool> UpdateProductVariantAsync(int productVariantId, bool published);
	}
}
