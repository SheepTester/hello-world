package JavaScript api;

//fn Main() -> i32 {
//	Print("Hello world");
//	return 0;
//}

// Outputs a React app
fn CreateReactApp(password: String) -> i32 {
	if (password == "123") {
		var app: String = """html
		<script type="module">
		import {{ createElement as h, useState } from 'https://esm.sh/react'
		import ReactDOM from 'https://esm.sh/react-dom'

		const App = () => {{
		  const [clicks, setClicks] = useState(0);
		  return h('button', {{ onClick: () => setClicks(clicks => clicks + 1) }, clicks)
		}

		ReactDOM.render(h(App), document.body)
		</script>
		""";
		Print(app);
		return 0;
	}
	return 1;
}

fn Main() -> i32 {
	return CreateReactApp("123");
}
