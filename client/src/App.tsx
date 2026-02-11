import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Create from "@/pages/Create";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/Admin";


declare global {
  interface Window {
    Telegram?: any;
  }
}

const tg = window.Telegram?.WebApp;
tg?.expand();

const user = tg?.initDataUnsafe?.user;
const tgUserId = user?.id;


function Router() {
  return (
    <Switch>
      <Route path="/" component={Create} />
      <Route path="/create" component={Create} />
	<Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
      <TooltipProvider>
        <Router />
      </TooltipProvider>
  );
}

export default App;
