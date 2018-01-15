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
using System.Linq;

namespace losol.EventManagement.Services
{
    public interface IRenderService
    {
        Task<string> RenderViewToStringAsync(string pageName, object model);
    }
 
    public class ViewRenderService : IRenderService
    {
        private readonly IRazorViewEngine _viewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IServiceProvider _serviceProvider;
 
        public ViewRenderService(
			IRazorViewEngine viewEngine,
            ITempDataProvider tempDataProvider,
            IServiceProvider serviceProvider
			)
        {
            _viewEngine = viewEngine;
            _tempDataProvider = tempDataProvider;
            _serviceProvider = serviceProvider;
        }
 
		public async Task<string> RenderViewToStringAsync(string pageName, object model)
		{

			var actionContext = GetActionContext();
			var view = FindView(actionContext, pageName);
		
			//var pageResult = _viewEngine.GetPage(null, "/Pages/" + pageName);
			//var page = pageResult.Page;

			using (var sw = new StringWriter())
            {
				var viewContext = new ViewContext(
						actionContext,
						view,
						new ViewDataDictionary<object>(
                        metadataProvider: new EmptyModelMetadataProvider(),
                        modelState: new ModelStateDictionary())
							{
								Model = model
							},
					    new TempDataDictionary(
                        actionContext.HttpContext,
                        _tempDataProvider),
						sw,
						new HtmlHelperOptions()
				); 
				
				await view.RenderAsync(viewContext);
				Console.WriteLine(sw.ToString());
				return sw.ToString();
			}
			
			
			
		}
		
		private IView FindView(ActionContext actionContext, string viewName)
        {
            var getViewResult = _viewEngine.GetView(executingFilePath: null, viewPath: viewName, isMainPage: true);
            if (getViewResult.Success)
            {
                return getViewResult.View;
            }

            var findViewResult = _viewEngine.FindView(actionContext, viewName, isMainPage: true);
            if (findViewResult.Success)
            {
                return findViewResult.View;
            }

            var searchedLocations = getViewResult.SearchedLocations.Concat(findViewResult.SearchedLocations);
            var errorMessage = string.Join(
                Environment.NewLine,
                new[] { $"Unable to find view '{viewName}'. The following locations were searched:" }.Concat(searchedLocations)); ;

            throw new InvalidOperationException(errorMessage);
        }

		private ActionContext GetActionContext()
        {
            var httpContext = new DefaultHttpContext();
			httpContext.RequestServices = _serviceProvider;
            
            return new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        }
	}
}
