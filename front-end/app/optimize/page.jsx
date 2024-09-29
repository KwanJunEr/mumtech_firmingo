"use client";
import { Input, Form, Button } from "antd";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  CheckCheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
  },
};

export const description =
  "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action.";

export default function Dashboard() {
  const [message, setMessage] = useState("Loading");
  const [userData, setUserData] = useState([]);
  const [aiResponse, setAiResponse] = useState([]);

  const handleReload = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8080/api/reload", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

       

        const data = await response.json();
        
    } catch (error) {
        alert("Reloading....");
    }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8080/api/user");
        const data = await response.json();
        console.log("Fetched data:", data); // Log the entire response for debugging

        // Check the structure of the data and adjust accordingly
        if (Array.isArray(data)) {
          setUserData(data); // If data is an array
        } else if (data.users && Array.isArray(data.users)) {
          // If data contains an array of users
          setUserData(data.users);
        } else if (data.email && data.name) {
          // If data is a single user object
          setUserData([data]); // Wrap it in an array to set
        } else {
          console.error("Unexpected data structure:", data);
          setUserData([]); // Set to an empty array if not as expected
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData([]); // Set to an empty array on error
      }
    };

    fetchData();
  }, []);

  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const { code } = values;
    console.log("Submitting code:", code);

    try {
      const response = await fetch("http://127.0.0.1:8080/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        console.log(data.ai_response);
        
        setAiResponse(data.ai_response);
        alert("Code submitted and processed successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error message from server:", errorData.message);
        alert("Error: " + errorData.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: " + error.message);
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Firmigo</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/failure"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <CheckCheckIcon className="h-4 w-4" />
               Issue Checker
              </Link>

              <Link
                href="/maintenance"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Maintenance Dashboard
              </Link>

              <Link
                href="/optimize"
                className="flex items-center gap-3 rounded-lg  px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Code Optimization
              </Link>


              <Link
                href="/predict"
                className="flex items-center gap-3 rounded-lg  px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                HardWare Failure Prediction
              </Link>

              
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Firmigo</span>
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    6
                  </Badge>
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col text-left">
            <h1 className="text-lg font-semibold md:text-2xl">
              Code Optimizer
            </h1>
            <div className="flex flex-row w-full justify-between">
               <p>
                Place your firmware codes here and we will help you to optimize your codes
              </p>
              <Button type="primary" onClick={handleReload}>
                Reload
              </Button>
            </div>
           
          </div>

          <div className="flex flex-col gap-4 h-full">
            {/*Part 1*/}
            <div className="bg-white w-full rounded-lg border border-dashed shadow-sm p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Place your code here to optimize it</h3>
                <p className="text-sm text-left">
                  Upload your firmware codes along with the prompt to do stuff
                </p>
              </div>

              <Form
                layout="vertical" // Changed to "vertical" for better form styling
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: "Code is required!" }]}
                >
                  <Input.TextArea
                    style={{ height: "200px" }} // Adjust the height here
                    placeholder="Please paste or upload your code in the area below. Ensure the code is properly formatted before submission."
                  />
                </Form.Item>

                <div className="flex w-full justify-end mt-4">
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </div>
              </Form>
            </div>

            {/*Part 2 Error Issues*/}

            <div className="bg-gray-100 max-w-[1200px] flex flex-col rounded-lg border border-dashed shadow-sm p-4">
              <h3 className="text-xl font-semibold">Optimized Codes Result</h3>
              <div className="mt-4 whitespace-pre-wrap">
             <div className="px-1 bg-white border border-dashed max-w-[1200px] overflow-auto">
                 {aiResponse && <pre>{aiResponse}</pre>} {/* Using <pre> to format the text */}
             </div>
             
              </div>
            </div>


            {/*Export Result as CSV Button */}
            <div className="mt-2 flex w-full justify-end items-end">
                <Button type="primary" className="h-10 font-bold">  Export Result as Docx</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
