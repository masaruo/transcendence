


window.onload = function(){
	const path = window.location.pathname.split("/");

	switch(path[1]){
		case "":
		{
			loadPage("home");
			break ;
		}
		case "about":
		{
			loadPage("about");
			break ;
		}
		case "home":
		{
			loadPage("home");
			break ;
		}
		case "pricing":
		{
			loadPage("pricing");
			break ;
		}
		default:
		{
			loadPage("404");
			break ;
		}
	}

	document.querySelectorAll(".menu__item").forEach((item: Element) => {
		const path = item.getAttribute("value");
		loadPage(path);
		if (path == "")
		{
			window.history.pushState("", "", "/");
			return ;
		}
		window.history.pushState("", "", path);
	});

	function loadPage($path: string | null)
	{
		if ($path == "" || $path == null) return ;

		const container = document.getElementById("container");

		const request = new XMLHttpRequest();
		request.open("GET", "pages/" + $path + ".html");
		request.send();
		request.onload = function ()
		{
			if (request.status == 200)
			{
				if (container == null)
					return ;
				container.innerHTML = request.responseText;
				document.title = $path;
			}
		}
	}
}
