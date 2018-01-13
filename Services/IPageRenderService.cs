using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.AspNetCore.Routing;
 
namespace losol.EventManagement.Services
{
    public interface IPageRenderService
    {
        Task<string> RenderPageToStringAsync(string pageName, object model);
    }
 
    public class PageRenderService : IPageRenderService
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IServiceProvider _serviceProvider;
		private readonly IHttpContextAccessor _httpContext;
		private readonly IActionContextAccessor _actionContext;
 
        public PageRenderService(
			IRazorViewEngine razorViewEngine,
            ITempDataProvider tempDataProvider,
            IServiceProvider serviceProvider,
			IHttpContextAccessor httpContext,
			IActionContextAccessor actionContext
			)
        {
            _razorViewEngine = razorViewEngine;
            _tempDataProvider = tempDataProvider;
            _serviceProvider = serviceProvider;
			_httpContext = httpContext;
			_actionContext = actionContext;
        }
 
		public async Task<string> RenderPageToStringAsync(string pageName, object model)
		{
			var tempData = new TempDataDictionary(_httpContext.HttpContext, _tempDataProvider);

			var viewDictionary = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
			{
				Model = model
			};

			var actionContext = new ActionContext(
				_httpContext.HttpContext, 
				_httpContext.HttpContext.GetRouteData(), 
				_actionContext.ActionContext.ActionDescriptor
			);

			var page = _razorViewEngine.FindPage(actionContext, pageName).Page;
	
			using (var sw = new StringWriter())
            {
				page.ViewContext = new ViewContext(
						actionContext,
						page.ViewContext.View, 
						viewDictionary,
						tempData,
						sw,
						new HtmlHelperOptions()
				);
				Console.WriteLine("*********");
				Console.WriteLine(page.BodyContent);

				await page.ExecuteAsync();
			}
			
	
			Console.WriteLine("*********");
			Console.WriteLine("0:" + page);
				
			if (page == null)
			{
				throw new ArgumentNullException($"Sorry. {pageName} does not match any available page");
			}
			await page.ExecuteAsync();

			return page.BodyContent.ToString();
			/*
				//var getPage = _razorViewEngine.GetPage("/Pages/" + pageName, "/Pages/" + pageName);
				var tempData = new TempDataDictionary(actionContext.HttpContext, _tempDataProvider);

				var viewContext = new ViewContext(
					actionContext,
					page.ViewContext.View, 
					viewDictionary,
					tempData,
					sw,
					new HtmlHelperOptions());

				await page.ExecuteAsync();

				Console.WriteLine("4:" + page.BodyContent);
				return page.BodyContent.ToString();

			*/

				/*
				var tempData = new TempDataDictionary(_httpContext, _tempDataProvider);
				var htmlHelper = new HtmlHelperOptions();
				if (pageResult.Page == null)
				{
					throw new ArgumentNullException($"{pageName} does not match any available page");
				}
				Console.WriteLine("1:" + pageResult.Page);
				Console.WriteLine("2:" + pageResult.Page.BodyContent);

				var viewDictionary = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = model
                };


				await page.ExecuteAsync();

				Console.WriteLine("3:" + pageResult.Page);
			 */ 


				//await viewRenderAsync(viewContext);

				/*	actionContext,
					pageResult.Page.ViewContext.View,
					viewDictionary,
					tempData,
					sw,
					htmlHelper
				);*/

				
				
				
			
		}
	}
}
