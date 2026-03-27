import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Zap, Crosshair, ChevronRight, Binary, Globe, Cpu } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-black font-mono text-gray-300 selection:bg-cyber-red selection:text-white overflow-x-hidden">
            {/* Background HUD Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
                <div className="scanline"></div>
            </div>

            {/* Header Overlap for Landing */}
            <Header
                showUserInfo={!!user}
                showLogout={!!user}
                rightContent={!user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-cyber-red transition-all px-4 py-2 border border-transparent hover:border-cyber-red/30">
                            Login_Portal
                        </Link>
                        <Link to="/register" className="text-[10px] font-black uppercase tracking-[0.3em] bg-cyber-red/10 border border-cyber-red text-cyber-red px-6 py-2 shadow-neon-red hover:bg-cyber-red hover:text-black transition-all">
                            Join_Network
                        </Link>
                    </div>
                ) : undefined}
            />

            <main className="flex-1 z-10 relative">

                {/* Hero HUD Section */}
                <section className="relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-6 border-b border-cyber-red/20 bg-cyber-black/40">
                    {/* Decorative Circular Brackets */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyber-red/5 rounded-full animate-spin-slow"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyber-red/10 rounded-full border-dashed animate-reverse-spin"></div>

                    {/* Brand Icon Module */}
                    <div className="relative mb-12 group">
                        <div className="absolute -inset-4 bg-cyber-red blur-2xl opacity-10 group-hover:opacity-20 transition-opacity animate-pulse"></div>
                        <div className="w-56 h-56 border-2 border-cyber-red p-2 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyber-red"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyber-red"></div>

                            <div className="w-full h-full bg-cyber-gray/20 overflow-hidden relative">
                                <img src="./../../publics/cv_pothole_img.jpg" alt="Pothole Guard Core" className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyber-red text-black font-black text-[10px] tracking-[0.4em] uppercase shadow-neon-red">
                            Core_A.I._Active
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-cyber-red tracking-[0.1em] uppercase mb-6 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                        Pothole_Guard_AI
                    </h1>
                    <p className="max-w-3xl text-gray-400 text-sm md:text-lg uppercase tracking-[0.4em] font-bold leading-relaxed mb-12">
                        Advanced Neural Computer Vision for Autonomous Roadway Anomaly Intelligence.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-8 text-[12px] font-black uppercase tracking-[0.5em] text-cyber-red-dim">
                        <span className="flex items-center gap-2"><Crosshair className="w-4 h-4" /> Real-Time_Scanner</span>
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 12ms_Latency</span>
                        <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Geotagged_Logs</span>
                    </div>
                </section>

                {/* Content Section: System Dossier */}
                <section className="max-w-6xl mx-auto py-24 px-6 space-y-32">

                    {/* Section: Overview */}
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8 order-2 lg:order-1">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-cyber-neon mb-2">
                                    <Activity className="w-6 h-6" />
                                    <span className="text-xs font-black uppercase tracking-[0.5em]">System_Overview</span>
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-widest uppercase border-l-4 border-cyber-red pl-6 py-2">
                                    Neural_Detection_Core
                                </h2>
                            </div>
                            <div className="space-y-6 text-gray-400 text-md leading-loose tracking-wide">
                                <p>
                                    Computer vision pothole detection is an automated technique that uses cameras and AI algorithms to identify potholes (craters or depressions in road surfaces) from images or video in real time or near real time. It helps municipalities maintain roads more efficiently, improves driver safety by warning vehicles, and supports advanced driver-assistance systems (ADAS) or autonomous vehicles.
                                </p>
                                <p>
                                    Potholes form when water weakens the road base and traffic erodes the surface, creating hazards that damage vehicles, increase accidents, and raise maintenance costs. Traditional manual inspections are slow, expensive, subjective, and dangerous, so computer vision provides a scalable, objective alternative.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 relative order-1 lg:order-2 group">
                            <div className="absolute inset-0 bg-cyber-red opacity-10 blur-3xl group-hover:opacity-20 transition-all"></div>
                            <div className="relative border-2 border-cyber-red/30 p-2 overflow-hidden">
                                <img src="./../../publics/street_pothole_detection.jpeg" alt="Road Diagram" className="w-full grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700" />
                                <div className="absolute top-0 right-0 p-3 bg-cyber-red text-black text-[9px] font-black uppercase tracking-widest">FIG_001: GEOSPATIAL_GRID</div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Core Pipeline HUD */}
                    <div className="bg-cyber-black/60 border-2 border-cyber-red/20 p-12 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-red/5 -skew-x-[45deg] translate-x-12 -translate-y-12"></div>

                        <h2 className="text-2xl font-black text-cyber-red tracking-[0.4em] uppercase mb-12 flex items-center">
                            <Binary className="w-8 h-8 mr-6 text-cyber-neon" /> 4-Stage_Data_Pipeline
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                            <div className="space-y-4 border-l-2 border-gray-800 pl-6 hover:border-cyber-red transition-all">
                                <p className="text-cyber-neon font-black tracking-widest uppercase">01 // Data_Acquisition</p>
                                <p className="text-gray-400 leading-relaxed">Cameras (single or stereo for depth), smartphones, vehicle-mounted setups, drones, or even thermal/LiDAR sensors capture road images or video. Stereo vision or depth cameras produce disparity/depth maps to estimate pothole depth and volume.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-gray-800 pl-6 hover:border-cyber-red transition-all">
                                <p className="text-cyber-neon font-black tracking-widest uppercase">02 // Preprocessing</p>
                                <p className="text-gray-400 leading-relaxed">Raw images undergo noise reduction (Gaussian/median filters), contrast enhancement (CLAHE), color space conversion (RGB to HSV/Grayscale), and geometric correction (perspective transform to normalize road plane). This stabilizes input and highlights pothole features.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-gray-800 pl-6 hover:border-cyber-red transition-all">
                                <p className="text-cyber-neon font-black tracking-widest uppercase">03 // Detection_&_Classification</p>
                                <p className="text-gray-400 leading-relaxed">Deep learning models (YOLO, SSD, Faster R-CNN) detect potholes as bounding boxes, while semantic segmentation (U-Net, DeepLab) classifies each pixel as road/pothole. Traditional methods use texture analysis (GLCM), shape descriptors, and shadow detection.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-gray-800 pl-6 hover:border-cyber-red transition-all">
                                <p className="text-cyber-neon font-black tracking-widest uppercase">04 // Post-processing_&_Reporting</p>
                                <p className="text-gray-400 leading-relaxed">Detected potholes are filtered by size/shape, georeferenced using GPS/IMU, severity is assessed (depth/volume thresholds), and alerts are sent to maintenance crews via dashboards, mobile apps, or APIs.</p>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center gap-6 pt-8 border-t border-cyber-red/10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse"></div>
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-cyber-neon">Network_Uplink: Active</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-700 tracking-widest">&gt; Output_Results: GPS-Tagged Alerts & Severity Metrics</span>
                        </div>
                    </div>

                    {/* Section: Main Approaches */}
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 relative group overflow-hidden">
                            <div className="absolute inset-0 border-r-4 border-cyber-neon z-20"></div>
                            <img src="./../../publics/pothole_detection_road_diagram.png" alt="Street Detection" className="w-full grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 scale-110 group-hover:scale-100" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="px-4 py-1 bg-cyber-neon text-black font-black text-[10px] tracking-widest uppercase">REAL_TIME_DEPLOYMENT_VIEW</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-cyber-red mb-2">
                                    <Cpu className="w-6 h-6 border border-cyber-red p-1" />
                                    <span className="text-xs font-black uppercase tracking-[0.5em]">Technical_Protocol</span>
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-widest uppercase">
                                    Detection_Frameworks
                                </h2>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-cyber-red">
                                        <ChevronRight className="w-4 h-4" />
                                        <h3 className="text-xs font-black tracking-widest uppercase">Traditional_2D_Image_Processing</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-7">Uses techniques like thresholding, edge detection (Canny/Sobel), and morphological operations. Simple and fast but struggles with varying lighting and shadows.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-cyber-red">
                                        <ChevronRight className="w-4 h-4" />
                                        <h3 className="text-xs font-black tracking-widest uppercase">3D_Point_Cloud_Modeling</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-7">Stereo cameras or LiDAR create 3D road surfaces. Algorithms detect deviations by comparing depths. Superior for depth/volume measurement.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-cyber-neon">
                                        <ChevronRight className="w-4 h-4" />
                                        <h3 className="text-xs font-black tracking-widest uppercase text-cyber-neon font-black shadow-[0_0_5px_rgba(0,255,185,0.4)]">Deep_Learning (SOTA)</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 pl-7">CNNs like YOLO (v8-seg) and Faster R-CNN learn features automatically. Real-time inference models achieve 90%+ mAP (mean Average Precision).</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Challenges & Future Tech */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 border-2 border-cyber-red/10 bg-cyber-gray/5 hover:border-cyber-red transition-all group">
                            <h3 className="text-xs font-black text-cyber-red uppercase tracking-[0.3em] mb-6 flex items-center">
                                <Globe className="w-4 h-4 mr-3" /> External_Factors
                            </h3>
                            <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest">
                                Lighting & Weather: Shadows, rain, and glare are mitigated via thermal imaging and advanced data augmentation.
                            </p>
                        </div>
                        <div className="p-8 border-2 border-cyber-red/10 bg-cyber-gray/5 hover:border-cyber-red transition-all group">
                            <h3 className="text-xs font-black text-cyber-red uppercase tracking-[0.3em] mb-6 flex items-center">
                                <Zap className="w-4 h-4 mr-3" /> Real-Time_Limits
                            </h3>
                            <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest">
                                Edge Device Deployment: Optimized YOLO models run on-vehicle hardware to provide instant driver alerts.
                            </p>
                        </div>
                        <div className="p-8 border-2 border-cyber-red/10 bg-cyber-gray/5 hover:border-cyber-red transition-all group">
                            <h3 className="text-xs font-black text-cyber-red uppercase tracking-[0.3em] mb-6 flex items-center">
                                <Shield className="w-4 h-4 mr-3" /> Dataset_Integrity
                            </h3>
                            <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest">
                                665+ High-Precision Labeled datasets from Roboflow are fused with visible and thermal streams for 24/7 reliability.
                            </p>
                        </div>
                    </div>

                    {/* Call to Action HUD Card */}
                    <div className="relative p-1 border-2 border-cyber-red shadow-neon-red overflow-hidden">
                        <div className="bg-cyber-red/5 p-12 flex flex-col items-center text-center space-y-8 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-red"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-red"></div>

                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Ready_to_Initialize_Network?</h3>
                            <p className="text-sm text-gray-400 max-w-2xl uppercase tracking-[0.1em] font-bold">
                                Automated detection reduces repair delays, lowers costs, and prevents accidents. Secure your infrastructure today.
                            </p>
                            <div className="flex gap-6">
                                <Link to="/register" className="bg-cyber-red text-black px-12 py-4 font-black uppercase tracking-[0.3em] text-sm hover:scale-105 active:scale-95 transition-all shadow-neon-red flex items-center gap-3">
                                    <Zap className="w-4 h-4" /> Initialize_Protocol
                                </Link>
                                <Link to="/login" className="border-2 border-cyber-red text-cyber-red px-12 py-4 font-black uppercase tracking-[0.3em] text-sm hover:bg-cyber-red hover:text-black transition-all">
                                    Portal_Login
                                </Link>
                            </div>
                        </div>
                    </div>

                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
