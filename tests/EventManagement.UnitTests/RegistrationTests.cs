using Xunit;

using losol.EventManagement.Domain;

namespace losol.EventManagement.UnitTests
{
	public class RegistrationTests
	{
		public class Verify_Should
		{
			[Fact]
			public void SucceedWhenNotVerified()
			{
				Registration registration = new Registration();
				var expected = true;

				registration.Verify();
				var actual = registration.Verified;

				Assert.Equal(expected, actual);
			}

			[Fact]
			public void SucceedWhenAlreadyVerified()
			{
				Registration registration = new Registration { Verified = true };
				var expected = true;

				registration.Verify();
				var actual = registration.Verified;

				Assert.Equal(expected, actual);
			}
		}
	}
}
