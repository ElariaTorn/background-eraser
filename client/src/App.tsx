import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Create from "@/pages/Create";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Create} />
      <Route path="/create" component={Create} />
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
