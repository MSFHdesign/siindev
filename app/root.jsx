import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,

  useRouteError,

} from "@remix-run/react";
import styles from "./tailwind.css";



export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "Siin dev, fullstack" }];
}

export function ErrorBoundary() {
  let error = useRouteError();
  console.log(error);
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col h-full">
       
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="relative text-center">
            <img
              src="https://i.imgflip.com/ibo0i.jpg?a475069"
              alt="Error"
              className="w-full"
            />
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between p-4">
              <p className="text-2xl md:text-4xl font-bold">
                {error.status} : this is {error.statusText} what you been
                looking for
              </p>

              <p className="text-xl bg-red-600 p-3 rounded-md self-center mt-4">
                {error.data}
              </p>
            </div>
          
          </div>
        </div>

        <Scripts />
      </body>
    </html>
  );
}
export default function App() {


  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}