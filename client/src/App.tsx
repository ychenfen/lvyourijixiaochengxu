import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DiaryList from "./pages/DiaryList";
import DiaryDetail from "./pages/DiaryDetail";
import DiaryEdit from "./pages/DiaryEdit";
import Footprints from "./pages/Footprints";
import Weather from "./pages/Weather";
import Nearby from "./pages/Nearby";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/diaries" component={DiaryList} />
      <Route path="/diaries/new" component={DiaryEdit} />
      <Route path="/diaries/:id" component={DiaryDetail} />
      <Route path="/diaries/:id/edit" component={DiaryEdit} />
      <Route path="/footprints" component={Footprints} />
      <Route path="/weather" component={Weather} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
