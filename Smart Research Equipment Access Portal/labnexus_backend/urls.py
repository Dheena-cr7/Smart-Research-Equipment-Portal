"""
URL configuration for labnexus_backend project — OptimusPrime Smart Research Equipment Portal.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize the admin site
admin.site.site_header = 'OptimusPrime Administration'
admin.site.site_title = 'OptimusPrime Admin'
admin.site.index_title = 'Smart Research Equipment Portal'
