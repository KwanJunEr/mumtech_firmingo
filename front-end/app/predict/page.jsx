"use client";
import { Upload, Button, message } from "antd";
import axios from "axios";
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
import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
// Removed duplicate import of message and Upload

const { Dragger } = Upload;


const props = {
  name: 'file',
  action: 'http://127.0.0.1:8080/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

export const description =
  "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action.";

export default function Dashboard() {

  const [formData, setFormData] = useState({
    deviceType: '',
    airTemperature: '',
    processTemperature: '',
    rotationalSpeed: '',
    torque: '',
    toolWear: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const[result,setResut] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://127.0.0.1:8080/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),  // formData should contain your form values
    });
    const result = await response.json();
    setResut(result);
    console.log(result);  // Handle the response from the backend
  };
  const [message, setMessage] = useState('');

  const handleUpload1 = async (event) => {
      const file = event.target.files[0];

      if (!file) {
          setMessage('No file selected.');
          return;
      }

      if (file.type !== 'text/csv') {
          setMessage('Please upload a valid CSV file.');
          return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
          const response = await fetch('http://127.0.0.1:8080/api/upload', {
              method: 'POST',
              body: formData,
          });

          const data = await response.json();
          setMessage(data.message);
          console.log(data.data); // Log the received data
      } catch (error) {
          setMessage('File upload failed.');
          console.error('Error:', error);
      }
  };



  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/data')  // Flask API endpoint
      .then((response) => response.json())
      .then((data) => {
        setData1(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      message.success(response.data.message);
      fetchData(); // Fetch the data after successful upload
    } catch (error) {
      message.error("Upload failed.");
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/upload");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const columns = data[0]
    ? Object.keys(data[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key,
      }))
    : [];

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
                Issue Identifer
              </Link>
              <Link
                href="/maintenance"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Maintenance Dashboard
              </Link>

              <Link
                href="/optimize"
                className="flex items-center gap-3 rounded-lg  px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Code Optimizer
              </Link>

              <Link
                href="/predict"
                className="flex items-center gap-3 rounded-lg  px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                HardWare Failure Prediction
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="dashboard-02-chunk-0">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
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
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex  flex-col  p-2 lg:gap-2 lg:p-2 ">
         <div>Hardware Predict Failure</div>

       <div>
       <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <label htmlFor="deviceType" className="block text-sm font-medium">
          Device Type
        </label>
        <select
          id="deviceType"
          name="deviceType"
          value={formData.deviceType}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">Select Device Type</option>
          <option value="Type A">Type A</option>
          <option value="Type B">Type B</option>
          <option value="Type C">Type C</option>
          {/* Add more device types as needed */}
        </select>
      </div>

      <div>
        <label htmlFor="airTemperature" className="block text-sm font-medium">
          Air Temperature
        </label>
        <input
          type="number"
          id="airTemperature"
          name="airTemperature"
          value={formData.airTemperature}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="processTemperature" className="block text-sm font-medium">
          Process Temperature
        </label>
        <input
          type="number"
          id="processTemperature"
          name="processTemperature"
          value={formData.processTemperature}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="rotationalSpeed" className="block text-sm font-medium">
          Rotational Speed
        </label>
        <input
          type="number"
          id="rotationalSpeed"
          name="rotationalSpeed"
          value={formData.rotationalSpeed}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="torque" className="block text-sm font-medium">
          Torque
        </label>
        <input
          type="number"
          id="torque"
          name="torque"
          value={formData.torque}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="toolWear" className="block text-sm font-medium">
          Tool Wear
        </label>
        <input
          type="number"
          id="toolWear"
          name="toolWear"
          value={formData.toolWear}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600"
      >
        Predict Failure
      </button>
    </form>
       </div>

       <div>
        {result}
       </div>
          
           
        </main>
      </div>
    </div>
  );
}
