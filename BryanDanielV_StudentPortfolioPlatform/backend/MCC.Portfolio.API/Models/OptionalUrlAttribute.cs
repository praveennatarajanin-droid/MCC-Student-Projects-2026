using System;
using System.ComponentModel.DataAnnotations;

namespace System.ComponentModel.DataAnnotations
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class OptionalUrlAttribute : DataTypeAttribute
    {
        public OptionalUrlAttribute() : base(DataType.Url)
        {
        }

        public override bool IsValid(object? value)
        {
            if (value == null)
            {
                return true;
            }

            var str = value as string;
            if (str != null && string.IsNullOrWhiteSpace(str))
            {
                return true;
            }

            return new UrlAttribute().IsValid(value);
        }
    }
}
