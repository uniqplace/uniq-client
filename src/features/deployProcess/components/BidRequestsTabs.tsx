import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { TabView, TabPanel } from 'primereact/tabview';
import { OpenBidPage } from './OpenBidPage';
import ManufacturerBidRequests from './ManufacturerBidRequests';

const BidRequestsTabs = () => {
    const user = useSelector((state: RootState) => state.user);
    const ismanufacturer = user?.role === 'manufacturer';

    if (!ismanufacturer) {
        return (
            <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                <OpenBidPage />
            </div>
        );
    }

    const [activeIndex, setActiveIndex] = useState(1);
    return (
        <div className="max-w-6xl w-full flex flex-col items-start mt-0 ml-0">
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="border-none bg-transparent"
                pt={{
                    nav: { className: "flex justify-start border-b border-gray-200 bg-transparent" },
                    root: { className: "bg-transparent border-none" },
                    tab: { className: "bg-transparent border-none" }
                }}
            >
                <TabPanel 
                    header={<span className={`text-base font-medium px-2 pb-2 ${activeIndex === 0 ? "text-gray-900" : "text-gray-400"}`}>Bid Requests I Created</span>}
                    className="bg-none m-0 p-0 mt-4"
                >
                    <OpenBidPage />
                </TabPanel>
                <TabPanel 
                    header={<span className={`text-base font-medium px-2 pb-2 ${activeIndex === 1 ? "text-gray-900" : "text-gray-400"}`}>Bid Requests Sent To Me</span>}
                    className="bg-none m-0 p-0 mt-4"
                >
                    <ManufacturerBidRequests />
                </TabPanel>
            </TabView>
        </div>
    );
};

export default BidRequestsTabs;
