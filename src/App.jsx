import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Stars, PerspectiveCamera, Float } from '@react-three/drei'
import * as THREE from 'three'

// --- 3D COMPONENTS ---

function CameraManager({ speed, isJumping }) {
  useFrame((state) => {
    if (speed > 1 && !isJumping) {
      state.camera.position.x += (Math.random() - 0.5) * (speed * 0.015)
      state.camera.position.y += (Math.random() - 0.5) * (speed * 0.015)
    }
    const targetFOV = isJumping ? 140 : 75
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFOV, 0.05)
    state.camera.updateProjectionMatrix()
  })
  return null
}

function SpaceShip({ speed }) {
  const { scene, animations } = useGLTF('/space_travel.glb')
  const { actions } = useAnimations(animations, scene)
  useEffect(() => { if (actions) Object.values(actions)[0].play().setEffectiveTimeScale(speed) }, [actions, speed])
  return <Float speed={speed}><primitive object={scene} /></Float>
}

function BlackHole() {
  const { scene } = useGLTF('/black_hole.glb')
  // Responsive Scale for BlackHole
  const scale = window.innerWidth < 768 ? 1.5 : 2.5
  return <Float speed={1}><primitive object={scene} scale={scale} position={[0, -1, -8]} /></Float>
}

function WormholeModel() {
  const { scene } = useGLTF('/wormhole.glb')
  const ref = useRef()
  useFrame(() => (ref.current.rotation.z += 0.005)) 
  return <primitive ref={ref} object={scene} scale={window.innerWidth < 768 ? 10 : 15} position={[0, 0, -20]} rotation={[Math.PI / 2, 0, 0]} />
}

function EarthModel() {
  const { scene } = useGLTF('/earth.glb')
  const ref = useRef()
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.003 })
  return (
    <group>
      <pointLight position={[5, 5, 5]} intensity={3} color="cyan" />
      <primitive ref={ref} object={scene} scale={window.innerWidth < 768 ? 2 : 3.5} position={[0, 0, 0]} />
    </group>
  )
}

function ProjectSceneModel() {
  const { scene } = useGLTF('/scence5.glb')
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })
  return (
    <group>
      <spotLight position={[10, 10, 10]} intensity={5} color="cyan" />
      <primitive ref={ref} object={scene} scale={window.innerWidth < 768 ? 4 : 6} position={[0, -2, 2]} />
    </group>
  )
}

// FIXED: Scene 6 Model (Fully Responsive Scale)
function ContactModel() {
  const { scene } = useGLTF('/scence6.glb') 
  const ref = useRef()
  
  // Detect mobile
  const isMobile = window.innerWidth < 768
  const dynamicScale = isMobile ? 2 : 3
  const dynamicPosition = isMobile ? [0, 0, 0] : [0, 0, 0]

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.15
    }
  })

  return (
    <group>
      <pointLight position={[5, 5, 5]} intensity={5} color="cyan" />
      <primitive 
        ref={ref} 
        object={scene} 
        scale={dynamicScale} 
        position={dynamicPosition} 
      />
    </group>
  )
}

// --- UI COMPONENTS ---

const SkillBar = ({ name, percent }) => (
  <div style={{ marginBottom: '15px', textAlign: 'left' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
      <span style={{ fontSize: '0.9rem' }}>{name}</span>
      <span style={{ color: 'cyan', fontSize: '0.9rem' }}>{percent}%</span>
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: 'cyan', borderRadius: '10px', boxShadow: '0 0 10px cyan' }}></div>
    </div>
  </div>
)

const ProjectCard = ({ title, role, desc, tags, code, demo }) => (
  <div className="project-card">
    <h3 style={{ color: 'cyan', marginBottom: '5px' }}>{title}</h3>
    <p style={{ fontSize: '0.8rem', color: '#00ffff', opacity: 0.8, marginBottom: '10px', textTransform: 'uppercase' }}>{role}</p>
    <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '15px' }}>{desc}</p>
    <div style={{ marginBottom: '20px' }}>
      {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
    </div>
    <div style={{ display: 'flex', gap: '15px' }}>
      <a href={code} target="_blank" rel="noreferrer" className="proj-link">CODE</a>
      <a href={demo} target="_blank" rel="noreferrer" className="proj-link demo">DEMO</a>
    </div>
  </div>
)

// --- MAIN APP ---

export default function App() {
  const [speed, setSpeed] = useState(1)
  const [currentScene, setCurrentScene] = useState('travel')
  const [isJumping, setIsJumping] = useState(false)
  const [flash, setFlash] = useState(false)
  const timerRef = useRef(null)

  const handleJump = (nextScene) => {
    setIsJumping(true); setSpeed(12)
    setTimeout(() => {
      setFlash(true)
      setTimeout(() => {
        setCurrentScene(nextScene); setIsJumping(false)
        setSpeed(nextScene === 'travel' ? 1 : 0.2)
        window.scrollTo(0, 0)
        setTimeout(() => setFlash(false), 800)
      }, 200)
    }, 1000)
  }

  const startWarp = () => {
    setSpeed(8)
    timerRef.current = setTimeout(() => handleJump('blackhole'), 5000)
  }

  return (
    <div style={{ 
      width: '100vw', height: '100vh', background: '#000', position: 'relative', 
      overflowY: currentScene === 'travel' ? 'hidden' : 'auto', color: 'white', fontFamily: '"Inter", sans-serif' 
    }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(0,255,255,0.2); backdrop-filter: blur(10px); flex: 1; text-align: center; }
        .timeline-container { position: relative; max-width: 800px; margin: 40px auto; padding-left: 30px; border-left: 2px solid cyan; text-align: left; }
        .timeline-item { position: relative; margin-bottom: 40px; animation: fadeIn 1s ease-out forwards; }
        .timeline-dot { position: absolute; left: -41px; top: 5px; width: 20px; height: 20px; background: cyan; border-radius: 50%; box-shadow: 0 0 10px cyan; }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 30px; width: 100%; }
        .skill-box { background: rgba(0,0,0,0.7); padding: 25px; border-radius: 20px; border: 1px solid rgba(0,255,255,0.2); backdrop-filter: blur(12px); }
        .tag { display: inline-block; background: rgba(0,255,255,0.1); border: 1px solid cyan; padding: 4px 10px; border-radius: 20px; margin: 4px; font-size: 0.75rem; }
        .project-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 24px; backdrop-filter: blur(10px); transition: 0.3s; text-align: left; animation: fadeIn 1s forwards; }
        .project-card:hover { border-color: cyan; transform: translateY(-5px); background: rgba(0,255,255,0.05); }
        .proj-link { color: cyan; text-decoration: none; font-weight: bold; font-size: 0.8rem; border-bottom: 1px solid cyan; padding-bottom: 2px; }
        .input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); padding: 12px; border-radius: 8px; color: white; margin-bottom: 15px; outline: none; }
        .input-field:focus { border-color: cyan; box-shadow: 0 0 10px rgba(0,255,255,0.3); }
        .contact-btn { width: 100%; padding: 15px; background: cyan; color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .contact-btn:hover { background: #00cccc; transform: scale(1.02); }

        /* RESPONSIVE FIXES */
        @media (max-width: 768px) {
          h1 { font-size: 2rem !important; }
          h2 { font-size: 1.2rem !important; }
          .timeline-container { margin: 20px auto; padding-left: 20px; }
          .timeline-dot { left: -31px; }
          .grid-container { grid-template-columns: 1fr !important; }
          .project-card { padding: 20px; }
          
          /* Prevent 3D model from stealing scroll focus on mobile */
          canvas { pointer-events: none !important; }
          
          /* Make content more readable over 3D backgrounds on small screens */
          .skill-box, .project-card, .timeline-item {
            background: rgba(0,0,0,0.8) !important;
            backdrop-filter: blur(5px);
          }
        }
      `}} />

      <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 100, pointerEvents: 'none', transition: 'opacity 0.8s', opacity: flash ? 1 : 0 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={window.innerWidth < 768 ? 90 : 75} />
          <CameraManager speed={speed} isJumping={isJumping} />
          <Stars radius={100} count={isJumping ? 15000 : 5000} speed={speed} />
          <ambientLight intensity={1.5} />
          <Suspense fallback={null}>
            {currentScene === 'travel' && <SpaceShip speed={speed} />}
            {currentScene === 'blackhole' && <BlackHole />}
            {currentScene === 'wormhole' && <WormholeModel />}
            {currentScene === 'earth' && <EarthModel />}
            {currentScene === 'projects' && <ProjectSceneModel />}
            {currentScene === 'contact' && <ContactModel />}
          </Suspense>
          <OrbitControls 
            enableZoom={currentScene === 'contact'} 
            enableRotate={currentScene !== 'travel' && window.innerWidth > 768} 
            enablePan={false}
          />
        </Canvas>
      </div>

      {/* --- SCENE 1: TRAVEL --- */}
      {currentScene === 'travel' && (
        <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h2 style={{ letterSpacing: '2px', textAlign: 'center', maxWidth: '800px' }}>Welcome to my portfolio — a snapshot of my learning, projects, and passion for technology</h2>
          <button onMouseDown={startWarp} onMouseUp={() => {clearTimeout(timerRef.current); setSpeed(1)}} style={{ padding: '15px 40px', background: 'transparent', color: 'cyan', border: '1px solid cyan', cursor: 'pointer', fontWeight: 'bold', marginTop: '30px' }}>INITIALIZE JUMP</button>
        </div>
      )}

      {/* --- SCENE 2: PROFILE --- */}
      {currentScene === 'blackhole' && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center', padding: '60px 20px' }}>
           <div style={{ width: window.innerWidth < 768 ? '180px' : '250px', height: window.innerWidth < 768 ? '180px' : '250px', borderRadius: '50%', border: '5px solid cyan', overflow: 'hidden', margin: '0 auto 30px', boxShadow: '0 0 30px cyan' }}>
              <img src="/Profile.jpeg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
           <h1>Hello, I'm <span style={{ color: 'cyan' }}>Pandranki Sai Lalith</span></h1>
           <p style={{ maxWidth: '600px', margin: '20px auto', opacity: 0.8 }}>B.Tech ECE Student | IoT & AI Enthusiast</p>
           <button onClick={() => handleJump('wormhole')} style={{ marginTop: '50px', padding: '15px 50px', background: 'cyan', color: 'black', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>MY JOURNEY</button>
        </div>
      )}

      {/* --- SCENE 3: JOURNEY --- */}
      {currentScene === 'wormhole' && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center', padding: '60px 0' }}>
          <div style={{ animation: 'fadeIn 1s forwards', maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', color: 'cyan', textShadow: '0 0 20px cyan' }}>My Journey</h1>
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '30px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', marginBottom: '50px' }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                I'm a final-year B.Tech student in <b>Electronics and Communication Engineering at MVGR College of Engineering</b>. I specialize in bridging the gap between hardware and software, creating intelligent systems that solve real-world problems.
              </p>
            </div>
            <h2 style={{ color: 'cyan', letterSpacing: '4px' }}>EDUCATION TIMELINE</h2>
            <div className="timeline-container">
              <div className="timeline-item"><div className="timeline-dot" /><h3 style={{ color: 'cyan', margin: '0' }}>Ravindhra Bharathi School</h3><span style={{ opacity: 0.6 }}>2010 - 2020</span><p>Foundation education with focus on mathematics and sciences.</p></div>
              <div className="timeline-item"><div className="timeline-dot" /><h3 style={{ color: 'cyan', margin: '0' }}>Sri Gayatri Junior College</h3><span style={{ opacity: 0.6 }}>2020 - 2022</span><p>Intermediate MPC education.</p></div>
              <div className="timeline-item"><div className="timeline-dot" /><h3 style={{ color: 'cyan', margin: '0' }}>MVGR College of Engineering</h3><span style={{ opacity: 0.6 }}>2022 - 2026</span><p>B.Tech in ECE.</p></div>
            </div>
            <button onClick={() => handleJump('earth')} style={{ padding: '20px 60px', background: 'cyan', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>VIEW TECHNICAL SKILLS</button>
          </div>
        </div>
      )}

      {/* --- SCENE 4: SKILLS --- */}
      {currentScene === 'earth' && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ animation: 'fadeIn 1s forwards', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', color: 'cyan' }}>Technical Skills</h1>
            <div className="grid-container">
              <div className="skill-box"><h3 style={{ color: 'cyan' }}>Programming</h3><SkillBar name="Python" percent={90} /><SkillBar name="C/C++" percent={85} /><SkillBar name="JavaScript" percent={80} /><SkillBar name="Java" percent={75} /></div>
              <div className="skill-box"><h3 style={{ color: 'cyan' }}>Web Tech</h3><SkillBar name="HTML/CSS" percent={90} /><SkillBar name="Django" percent={80} /><SkillBar name="React" percent={75} /><SkillBar name="Node.js" percent={70} /></div>
              <div className="skill-box"><h3 style={{ color: 'cyan' }}>Hardware/IoT</h3><SkillBar name="IoT Systems" percent={85} /><SkillBar name="Arduino" percent={85} /><SkillBar name="ARM7/8051" percent={80} /><SkillBar name="PCB Design" percent={70} /></div>
              <div className="skill-box"><h3 style={{ color: 'cyan' }}>AI & Cloud</h3><SkillBar name="Machine Learning" percent={80} /><SkillBar name="Deep Learning" percent={75} /><SkillBar name="Computer Vision" percent={75} /><SkillBar name="AWS" percent={70} /></div>
            </div>
            <button onClick={() => handleJump('projects')} style={{ marginTop: '60px', padding: '20px 60px', background: 'cyan', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>EXPLORE PROJECTS</button>
          </div>
        </div>
      )}

      {/* --- SCENE 5: PROJECTS --- */}
      {currentScene === 'projects' && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', color: 'cyan', textShadow: '0 0 20px cyan' }}>Featured Projects</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              <ProjectCard title="Gait Recognition using GaitFormer" role="ML Research Intern" desc="Advanced ML for human gait recognition using transformers at NIT Warangal." tags={["Python", "PyTorch", "Deep Learning"]} code="#" demo="#" />
              <ProjectCard title="LPG/Smoke Detector" role="Hardware Developer" desc="IoT system for detecting gas leaks using ARM7." tags={["ARM7", "C", "IoT"]} code="#" demo="#" />
              <ProjectCard title="0-10V Digital Voltmeter" role="Embedded Developer" desc="Precision voltmeter using 8051 microcontroller." tags={["8051", "C", "Embedded"]} code="#" demo="#" />
              <ProjectCard title="Traffic Management System" role="IoT Developer" desc="Smart city automation project using Arduino." tags={["Arduino", "C++", "Sensors"]} code="#" demo="#" />
              <ProjectCard title="Blender 3D Model" role="3D Designer" desc="Creative 3D modeling and visualization project." tags={["Blender", "3D", "Animation"]} code="#" demo="#" />
            </div>
            <button onClick={() => handleJump('contact')} style={{ marginTop: '80px', padding: '20px 60px', background: 'cyan', color: 'black', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>GET IN TOUCH</button>
          </div>
        </div>
      )}

      {/* --- SCENE 6: CONTACT --- */}
      {currentScene === 'contact' && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '60px 20px', animation: 'fadeIn 1s forwards' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', color: 'cyan', textAlign: 'center', textShadow: '0 0 20px cyan' }}>Get In Touch</h1>
            <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '60px', opacity: 0.8 }}>Ready to collaborate on your next project?</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div className="skill-box" style={{ textAlign: 'left' }}>
                <h2 style={{ color: 'cyan', marginBottom: '25px' }}>Send a Message</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                  <label>Name</label><input type="text" className="input-field" placeholder="Your Name" />
                  <label>Email</label><input type="email" className="input-field" placeholder="your@email.com" />
                  <label>Subject</label><input type="text" className="input-field" placeholder="Collaboration Idea" />
                  <label>Message</label><textarea className="input-field" rows="4" placeholder="How can I help you?"></textarea>
                  <button className="contact-btn">Send Message</button>
                </form>
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ color: 'cyan', marginBottom: '20px' }}>Let's Connect</h2>
                <div className="stat-card" style={{ marginBottom: '15px', textAlign: 'left' }}><h4 style={{ color: 'cyan', margin: '0' }}>Email</h4><p style={{wordBreak: 'break-all'}}>sailalith26@gmail.com</p></div>
                <div className="stat-card" style={{ marginBottom: '15px', textAlign: 'left' }}><h4 style={{ color: 'cyan', margin: '0' }}>LinkedIn</h4><a href="https://linkedin.com/in/sai-lalith-854784259" target="_blank" style={{ color: 'white', textDecoration: 'none' }}>sai-lalith-854784259</a></div>
                <div className="stat-card" style={{ textAlign: 'left' }}><h4 style={{ color: 'cyan', margin: '0' }}>GitHub</h4><a href="https://github.com/sai200556" target="_blank" style={{ color: 'white', textDecoration: 'none' }}>github.com/sai200556</a></div>
              </div>
            </div>
            <button onClick={() => handleJump('travel')} style={{ marginTop: '80px', background: 'transparent', color: 'white', border: '1px solid white', padding: '10px 40px', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '80px auto 0' }}>RESTART JOURNEY</button>
          </div>
        </div>
      )}
    </div>
  )
}