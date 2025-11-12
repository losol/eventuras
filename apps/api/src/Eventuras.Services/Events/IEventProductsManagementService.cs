using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events;

public interface IEventProductsManagementService
{
    [Obsolete("Use Add/Remove product methods instead")]
    Task UpdateEventProductsAsync(int eventId, List<Product> products);

    /// <summary>
    ///     Adds new product to an event.
    /// </summary>
    /// <param name="product">The prefilled product with the event id set.</param>
    /// <exception cref="Exceptions.NotAccessibleException">Currently signed in user not permitted to edit event.</exception>
    Task AddProductAsync(Product product);

    /// <summary>
    ///     Saves changes made on a given product.
    /// </summary>
    /// <param name="product">The existing product.</param>
    /// <exception cref="Exceptions.NotAccessibleException">Currently signed in user not permitted to edit event.</exception>
    Task UpdateProductAsync(Product product);

    /// <summary>
    ///     Archives product.
    /// </summary>
    /// <param name="product">The existing product.</param>
    /// <exception cref="Exceptions.NotAccessibleException">Currently signed in user not permitted to edit event.</exception>
    Task ArchiveProductAsync(Product product);
}
