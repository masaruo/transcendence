# app/views.py
from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
import mimetypes

@csrf_exempt
def serve_media(request, path):
    try:
        file_path = f'/vol/web/media/{path}'
        content_type, _ = mimetypes.guess_type(file_path)

        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type or 'image/jpeg')

        # ORB対策のCORSヘッダー
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        response['Access-Control-Expose-Headers'] = '*'

        return response
    except (FileNotFoundError, PermissionError, IsADirectoryError):
        raise Http404()
