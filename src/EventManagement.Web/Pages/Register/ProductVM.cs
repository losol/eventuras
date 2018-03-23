using System;
namespace losol.EventManagement.Web.Pages.Register
{
	public class ProductVM
	{
		public bool IsSelected { get; set; } = false;
		public int Value { get; set; }
		public bool IsMandatory { get; set; } = false;
		public int? SelectedVariantId { get; set; } = null;
	}
}
