import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home, {
  AboutPage,
  AdminPage,
  ArticlesPage,
  ContactPage,
  ContentDetailPage,
  GuidesPage,
  LoginPage,
  ReportsPage,
  SearchPage,
  ToolDetailPage,
  ToolsPage,
} from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/tools" component={ToolsPage} />
      <Route path="/tools/:slug" component={ToolDetailPage} />
      <Route path="/articles/:slug" component={ContentDetailPage} />
      <Route path="/guides/:slug" component={ContentDetailPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
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
