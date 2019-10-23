import codecs
from string import Template

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

EMAIL_TEMPLATE = Template(
    '''<script>
  document.write(
    '$email_rot13'.replace(/[a-zA-Z]/g, function(c) {
      return String.fromCharCode(
        (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
      );
    })
  );
</script>
'''  # noqa: E501
)


@register.filter
@stringfilter
def obfuscate_email(value: str) -> str:
    return EMAIL_TEMPLATE.substitute(
        email_rot13=codecs.encode(
            f'<a href="mailto:{value}">{value}</a>', 'rot13'
        )
    )
