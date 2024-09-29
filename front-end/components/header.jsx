import { Button } from "@/components/ui/button";
import { Modal } from 'antd';
import React, { useState } from 'react';

export default function Header() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const showModal = () => {
        console.log("Showing modal...");
        setOpen(true);
    };

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 3000);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-screen-xl px-2 sm:px-6 lg:px-2">
                <div className="flex h-16 justify-between">
                    <div className="md:flex  md:gap-12 mt-5">
                        <a className="block text-teal-600" href="#">
                            <h1 className="font-bold text-2xl">Firmigo</h1>
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow"
                            onClick={showModal}>
                            Login
                        </button>

                        <Modal
                            open={open}
                            title="Login"
                            onOk={handleOk}
                            onCancel={handleCancel}
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Return
                                </Button>,
                                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                                    Submit
                                </Button>,
                                <Button
                                    key="link"
                                    href="https://google.com"
                                    type="primary"
                                    loading={loading}
                                >
                                    Search on Google
                                </Button>,
                            ]}
                        >
                            <p>Some contents...</p>
                            <p>Some contents...</p>
                            <p>Some contents...</p>
                            <p>Some contents...</p>
                            <p>Some contents...</p>
                        </Modal>
                    </div>
                </div>
            </div>
        </header>
    );
}
