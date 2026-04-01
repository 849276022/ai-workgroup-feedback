import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('submit')

  return (
    <div className="container">
      <header className="header">
        <h1>🤖 AI智能体工作小组</h1>
        <p>需求收集 | 智能建议 | 数据分析</p>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'submit' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('submit')}
        >
          📝 提交需求
        </button>
        <button 
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 数据看板
        </button>
        <button 
          className={activeTab === 'feedback' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('feedback')}
        >
          📋 反馈管理
        </button>
        <button 
          className={activeTab === 'about' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ 关于
        </button>
      </div>

      <div className="content">
        {activeTab === 'submit' && <SubmitForm />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'feedback' && <FeedbackList />}
        {activeTab === 'about' && <About />}
      </div>
    </div>
  )
}

function SubmitForm() {
  return (
    <div className="card-section">
      <h2 className="section-title">提交您的需求</h2>
      <p>功能开发中，敬请期待...</p>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="card-section">
      <h2 className="section-title">数据看板</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">0</div>
          <div className="label">总反馈数</div>
        </div>
        <div className="stat-card">
          <div className="number">0</div>
          <div className="label">紧急需求</div>
        </div>
        <div className="stat-card">
          <div className="number">0</div>
          <div className="label">今日新增</div>
        </div>
      </div>
    </div>
  )
}

function FeedbackList() {
  return (
    <div className="card-section">
      <h2 className="section-title">反馈列表</h2>
      <p>暂无反馈数据</p>
    </div>
  )
}

function About() {
  return (
    <div className="card-section">
      <h2 className="section-title">关于</h2>
      <p>AI智能体工作小组致力于帮助普通人利用AI技术提升效率、开拓副业。</p>
    </div>
  )
}

export default App
