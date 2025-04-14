from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render, reverse

from .models import Room

def index(request):
    return render(request, "chat/index.html")
    # if request.method == "POST":
    #     name = request.POST.get("name", None)
    #     if name:
    #         try:
    #             room = Room.manager.get(name=name)  #manager? objects?
    #             return HttpResponseRedirect(reverse("room", args=[room.pk]))
    #         except Room.DoesNotExist:
    #             pass
    #         room = Room.objects.create(name=name, host=request.user)
    #         return HttpResponseRedirect(reverse("room", args=[room.pk]))
    # return render(request, 'chat/index.html')  #! change accordingly


def room(request, room_name):
    # room = get_object_or_404(Room, pk=pk)
    return render(request, 'chat/room.html', {"room_name": room_name})
