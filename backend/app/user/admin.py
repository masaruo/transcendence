from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from . import models


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    ordering = ['id']
    list_display = ['id', 'email', 'nickname', 'is_online', 'is_active', 'is_staff', 'is_superuser']
    filter_horizontal = ('friends',)
    search_fields = ['email', 'nickname']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('nickname', 'avatar')}),
        (
            _('Permissions'),
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'is_online',
                )
            }
        ),
        (_('Relationships'), {'fields': ('friends',)}),
        (_('Important dates'), {'fields': ('last_login',)}),
    )
    readonly_fields = ['last_login']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'nickname',
                'password1',
                'password2',
                'is_active',
                'is_staff',
                'is_superuser',
            ),
        }),
        (_('Relationships'), {
            'classes': ('wide',),
            'fields': ('friends',),
        }),
    )


admin.site.register(models.User, UserAdmin)
