import { useState } from 'react'
import * as XLSX from 'xlsx'
import PptxGenJS from 'pptxgenjs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

interface PoliceRequest {
  id: string
  station: string
  officer: string
  contact: string
  category: string
  painPoint: string
  description: string
  urgency: string
  submitTime: string
}

function App() {
  const [activeTab, setActiveTab] = useState('submit')
  const [requests, setRequests] = useState<PoliceRequest[]>([])
  const [formData, setFormData] = useState({
    station: '',
    officer: '',
    contact: '',
    category: '',
    painPoint: '',
    description: '',
    urgency: '一般'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newRequest: PoliceRequest = {
      id: Date.now().toString(),
      ...formData,
      submitTime: new Date().toLocaleString('zh-CN')
    }
    
    const updatedRequests = [...requests, newRequest]
    setRequests(updatedRequests)
    await generateDocuments(updatedRequests, newRequest)
    
    alert('提交成功！文档已自动下载')
    setFormData({ station: '', officer: '', contact: '', category: '', painPoint: '', description: '', urgency: '一般' })
  }

  const generateDocuments = async (allData: PoliceRequest[], current: PoliceRequest) => {
    // Excel
    const ws = XLSX.utils.json_to_sheet(allData.map(r => ({
      '站点': r.station, '警员': r.officer, '联系方式': r.contact,
      '类别': r.category, '痛点': r.painPoint, '描述': r.description,
      '紧急度': r.urgency, '时间': r.submitTime
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '汇总')
    XLSX.writeFile(wb, `警务需求汇总_${new Date().toISOString().split('T')[0]}.xlsx`)

    // Word
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: '地铁警务需求报告', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: '站点：', bold: true }), new TextRun(current.station)] }),
          new Paragraph({ children: [new TextRun({ text: '警员：', bold: true }), new TextRun(current.officer)] }),
          new Paragraph({ children: [new TextRun({ text: '紧急度：', bold: true }), new TextRun(current.urgency)] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: '痛点描述', bold: true, size: 24 })] }),
          new Paragraph({ text: current.painPoint }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: '详细说明', bold: true, size: 24 })] }),
          new Paragraph({ text: current.description || '无' }),
        ]
      }]
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `需求报告_${current.station}_${new Date().toISOString().split('T')[0]}.docx`
    a.click()
    URL.revokeObjectURL(url)

    // PPT
    const pptx = new PptxGenJS()
    const s1 = pptx.addSlide()
    s1.addText('地铁警务需求汇报', { x: 1, y: 2, w: 8, h: 1, fontSize: 36, bold: true, align: 'center' })
    s1.addText(`汇报日期：${new Date().toLocaleDateString('zh-CN')}`, { x: 1, y: 3.5, w: 8, h: 0.5, fontSize: 16, align: 'center' })
    
    const s2 = pptx.addSlide()
    s2.addText('需求汇总统计', { x: 0.5, y: 0.5, fontSize: 24, bold: true })
    s2.addText(`总需求数：${allData.length} 项`, { x: 1, y: 1.5, fontSize: 18 })
    s2.addText(`紧急需求：${allData.filter(r => r.urgency === '紧急').length} 项`, { x: 1, y: 2.2, fontSize: 18, color: 'FF0000' })
    
    allData.forEach((r, i) => {
      const s = pptx.addSlide()
      s.addText(`${r.station} - ${r.category}`, { x: 0.5, y: 0.5, fontSize: 20, bold: true })
      s.addText(`提交人：${r.officer} | 紧急度：${r.urgency}`, { x: 0.5, y: 1.2, fontSize: 14, color: '666666' })
      s.addText('痛点：', { x: 0.5, y: 1.8, fontSize: 14, bold: true })
      s.addText(r.painPoint, { x: 0.5, y: 2.2, w: 9, h: 1.5, fontSize: 13 })
    })
    
    pptx.writeFile({ fileName: `需求汇报_${new Date().toISOString().split('T')[0]}.pptx` })
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🚇 地铁警务需求收集系统</h1>
        <p>聚焦业务痛点 | 智能文档生成</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'submit' ? 'tab active' : 'tab'} onClick={() => setActiveTab('submit')}>📝 提交需求</button>
        <button className={activeTab === 'list' ? 'tab active' : 'tab'} onClick={() => setActiveTab('list')}>📋 需求列表</button>
        <button className={activeTab === 'export' ? 'tab active' : 'tab'} onClick={() => setActiveTab('export')}>📊 导出数据</button>
      </div>

      {activeTab === 'submit' && (
        <form onSubmit={handleSubmit} className="card-section">
          <h2 className="section-title">提交工作需求</h2>
          
          <div className="form-group">
            <label>所属站点 *</label>
            <input value={formData.station} onChange={e => setFormData({...formData, station: e.target.value})} placeholder="如：朝阳广场站" required />
          </div>
          
          <div className="form-group">
            <label>警员姓名 *</label>
            <input value={formData.officer} onChange={e => setFormData({...formData, officer: e.target.value})} required />
          </div>
          
          <div className="form-group">
            <label>联系方式</label>
            <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="电话/微信" />
          </div>
          
          <div className="form-group">
            <label>问题类别 *</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">请选择</option>
              <option value="设备故障">设备故障</option>
              <option value="人员调配">人员调配</option>
              <option value="流程优化">流程优化</option>
              <option value="安全隐患">安全隐患</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>业务痛点 *</label>
            <input value={formData.painPoint} onChange={e => setFormData({...formData, painPoint: e.target.value})} placeholder="简述当前遇到的困难" required />
          </div>
          
          <div className="form-group">
            <label>详细描述</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="详细说明问题..." rows={3} />
          </div>
          
          <div className="form-group">
            <label>紧急程度</label>
            <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
              <option value="一般">🟢 一般</option>
              <option value="高">🟡 高</option>
              <option value="紧急">🔴 紧急</option>
            </select>
          </div>
          
          <button type="submit" className="btn-submit">🚀 提交并生成文档</button>
          <p style={{fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center'}}>
            提交后将自动下载：Excel + Word + PPT
          </p>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="card-section">
          <h2 className="section-title">已收集需求 ({requests.length})</h2>
          {requests.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>暂无需求，请先提交</p>
          ) : (
            <div className="feedback-list">
              {requests.map(r => (
                <div key={r.id} className="feedback-item">
                  <div className="title">{r.station} | {r.category}</div>
                  <div className="meta">{r.officer} | {r.urgency} | {r.submitTime}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="card-section" style={{textAlign: 'center', padding: '40px'}}>
          <h2 className="section-title">数据导出</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>已收集 {requests.length} 条需求</p>
          <button className="btn-submit" onClick={() => requests.length > 0 && generateDocuments(requests, requests[requests.length-1])}>
            📥 重新导出所有文档
          </button>
        </div>
      )}
    </div>
  )
}

export default App
