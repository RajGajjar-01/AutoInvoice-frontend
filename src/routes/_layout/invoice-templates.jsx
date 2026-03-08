import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Eye,
  Check,
  FileText,
  Receipt,
  Briefcase,
  ShoppingBag,
  Wrench,
  Pencil,
  Plus,
  Upload,
  Code2,
  Trash2,
} from "lucide-react"
import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/invoice-templates")({
  component: InvoiceTemplatesPage,
  head: () => ({
    meta: [{ title: "Invoice Templates" }],
  }),
})

// ─── Template definitions ────────────────────────────────────────────

const builtInTemplates = [
  {
    id: "clean-teal",
    name: "Clean Teal",
    description: "Bold teal heading with From/Bill To columns and a note footer",
    icon: FileText,
    cardColor: "bg-cyan-500/10 text-cyan-600",
    features: ["Teal header", "From/Bill To", "Note section"],
    preview: CleanTealPreview,
  },
  {
    id: "geometric",
    name: "Geometric",
    description: "Modern with teal and pink corner accents, signature line",
    icon: Briefcase,
    cardColor: "bg-pink-500/10 text-pink-600",
    features: ["Corner accents", "QTY + Price", "Signature"],
    preview: GeometricPreview,
  },
  {
    id: "circle-studio",
    name: "Circle Studio",
    description: "Minimalist black and white with centered logo and thank-you script",
    icon: Receipt,
    cardColor: "bg-slate-500/10 text-slate-600",
    features: ["Circle logo", "Unit Price + QTY", "Bank details"],
    preview: CircleStudioPreview,
  },
  {
    id: "aizen-bold",
    name: "Aizen Bold",
    description: "Bold company branding with red and black geometric design",
    icon: ShoppingBag,
    cardColor: "bg-red-500/10 text-red-600",
    features: ["Geometric accents", "Pink total row", "Sub-total + Tax"],
    preview: AizenBoldPreview,
  },
  {
    id: "simple-boxed",
    name: "Simple Boxed",
    description: "Clean bordered corporate style with a prominent total row",
    icon: Wrench,
    cardColor: "bg-teal-500/10 text-teal-600",
    features: ["Bordered table", "SL + Amount", "Grand Total"],
    preview: SimpleBoxedPreview,
  },
]

// ─── Individual themed previews ───────────────────────────────────────────────

// Template 1 — Clean Teal
function CleanTealPreview() {
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#fff',fontSize:12,color:'#1a1a1a',minHeight:480,display:'flex',flexDirection:'column'}}>
      {/* Body */}
      <div style={{padding:'28px 28px 0',flex:1}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <p style={{fontSize:36,fontWeight:900,color:'#0E7490',letterSpacing:-1,lineHeight:1}}>INVOICE</p>
          <div style={{textAlign:'right',border:'1px solid #e2e8f0',padding:'8px 12px',fontSize:10,color:'#555',minWidth:150}}>
            <div style={{marginBottom:3}}><span style={{color:'#94a3b8'}}>Date:</span> 12/07/2025</div>
            <div style={{marginBottom:3}}><span style={{color:'#94a3b8'}}>Invoice No:</span> 123456789</div>
            <div><span style={{color:'#94a3b8'}}>Due:</span> 11/08/2025</div>
          </div>
        </div>
        {/* FROM / BILL TO */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:18}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:'#555',borderBottom:'2px solid #0E7490',paddingBottom:3,marginBottom:7,textTransform:'uppercase'}}>From</div>
            <p style={{fontWeight:700,fontSize:11}}>INGOUDE COMPANY</p>
            <p style={{color:'#64748b',fontSize:9,marginTop:2}}>123-456-7890</p>
            <p style={{color:'#64748b',fontSize:9}}>123 Anywhere St., Any City, ST 12345</p>
            <p style={{color:'#64748b',fontSize:9}}>hello@ingoude.com</p>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:'#555',borderBottom:'2px solid #0E7490',paddingBottom:3,marginBottom:7,textTransform:'uppercase'}}>Bill To</div>
            <p style={{fontWeight:700,fontSize:11}}>AARON LOEB</p>
            <p style={{color:'#64748b',fontSize:9,marginTop:2}}>123-456-7890</p>
            <p style={{color:'#64748b',fontSize:9}}>456 Client Ave., Metro City, ST 54321</p>
            <p style={{color:'#64748b',fontSize:9}}>aaron@client.com</p>
          </div>
        </div>
        {/* Table */}
        <table style={{width:'100%',borderCollapse:'collapse',border:'1px solid #cbd5e1',fontSize:10}}>
          <thead>
            <tr style={{background:'#0E7490',color:'#fff'}}>
              <th style={{padding:'7px 8px',textAlign:'center',width:30}}>SL</th>
              <th style={{padding:'7px 10px',textAlign:'left'}}>Description</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {[['Design Work','₹5,000'],['Consultation','₹3,000'],['Development','₹8,000']].map(([d,a],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #e2e8f0',background:i%2===0?'#fff':'#f0fdfe'}}>
                <td style={{padding:'6px 8px',textAlign:'center',color:'#555'}}>{i+1}</td>
                <td style={{padding:'6px 10px'}}>{d}</td>
                <td style={{padding:'6px 10px',textAlign:'right',fontWeight:600}}>{a}</td>
              </tr>
            ))}
            <tr style={{borderTop:'2px solid #0E7490',background:'#f0fdfe'}}>
              <td colSpan={2} style={{padding:'8px 10px',fontWeight:700,textAlign:'right',fontSize:11}}>Total</td>
              <td style={{padding:'8px 10px',textAlign:'right',fontWeight:900,color:'#0E7490',fontSize:12}}>₹16,000</td>
            </tr>
          </tbody>
        </table>
        {/* Note box */}
        <div style={{border:'1px solid #e2e8f0',padding:'8px 12px',marginTop:12,fontSize:9,color:'#64748b',background:'#f8fafc'}}>
          <strong style={{color:'#1a1a1a'}}>Note:</strong> Please send payment within 30 days. Late payments attract 10% interest/month.
        </div>
        {/* Bank details */}
        <div style={{marginTop:10,fontSize:9,color:'#64748b'}}>Bank: HDFC &nbsp;|&nbsp; A/C: 0012345678 &nbsp;|&nbsp; IFSC: HDFC0000123</div>
      </div>
      {/* Footer */}
      <div style={{background:'#0E7490',marginTop:20,padding:'10px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <p style={{color:'rgba(255,255,255,0.85)',fontSize:9,fontStyle:'italic'}}>Thank you for your business!</p>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:8}}>Generated by AutoInvoice</p>
      </div>
    </div>
  )
}

// Template 2 — Geometric
function GeometricPreview() {
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#fff',fontSize:12,color:'#1a1a1a',minHeight:500,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      {/* Corner accents */}
      <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderLeft:'70px solid transparent',borderTop:'70px solid #0F766E'}} />
      <div style={{position:'absolute',top:0,right:38,width:0,height:0,borderLeft:'36px solid transparent',borderTop:'36px solid #EC4899'}} />
      <div style={{position:'absolute',bottom:0,left:0,width:0,height:0,borderRight:'56px solid transparent',borderBottom:'56px solid #EC4899'}} />
      {/* Body */}
      <div style={{padding:'28px 28px 0',flex:1}}>
        <p style={{fontSize:32,fontWeight:900,letterSpacing:-1,color:'#1a1a1a',marginBottom:20}}>INVOICE</p>
        {/* Date + From/Issued To */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:18}}>
          <div style={{fontSize:10,color:'#555'}}>
            <p style={{marginBottom:3}}><span style={{color:'#94a3b8'}}>Date Issued:</span> 01 January 2025</p>
            <p style={{marginBottom:3}}><span style={{color:'#94a3b8'}}>Invoice No:</span> 01234</p>
            <p><span style={{color:'#94a3b8'}}>Due Date:</span> 31 January 2025</p>
          </div>
          <div style={{fontSize:10}}>
            <p style={{color:'#94a3b8',fontSize:9,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Issued By</p>
            <p style={{fontWeight:700}}>INGOUDE COMPANY</p>
            <p style={{color:'#64748b',fontSize:9}}>123 Anywhere St., Any City</p>
            <p style={{color:'#94a3b8',fontSize:9,textTransform:'uppercase',letterSpacing:1,marginTop:8,marginBottom:4}}>Issued To</p>
            <p style={{fontWeight:700}}>Sacha Dubois</p>
            <p style={{color:'#64748b',fontSize:9}}>456 Client Ave., Metro City</p>
          </div>
        </div>
        {/* Table */}
        <table style={{width:'100%',borderCollapse:'collapse',border:'1px solid #e2e8f0',fontSize:10}}>
          <thead>
            <tr style={{background:'#f8f8f8',fontWeight:700,fontSize:9,textTransform:'uppercase',letterSpacing:0.5,color:'#666'}}>
              <th style={{padding:'8px 8px',textAlign:'center',width:30}}>NO</th>
              <th style={{padding:'8px 10px',textAlign:'left'}}>DESCRIPTION</th>
              <th style={{padding:'8px 10px',textAlign:'center'}}>QTY</th>
              <th style={{padding:'8px 10px',textAlign:'right'}}>PRICE</th>
              <th style={{padding:'8px 10px',textAlign:'right'}}>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[[1,'Design Work',1,'$100','$200'],[2,'Development',2,'$50','$100'],[3,'Consulting',1,'$80','$80']].map(([n,d,q,p,s],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #e2e8f0',background:i%2===0?'#fff':'#f8fffe'}}>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#555'}}>{n}</td>
                <td style={{padding:'7px 10px'}}>{d}</td>
                <td style={{padding:'7px 10px',textAlign:'center'}}>{q}</td>
                <td style={{padding:'7px 10px',textAlign:'right',fontFamily:'monospace'}}>{p}</td>
                <td style={{padding:'7px 10px',textAlign:'right',fontWeight:600,color:'#0F766E',fontFamily:'monospace'}}>{s}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} />
              <td style={{padding:'8px 10px',textAlign:'right',fontWeight:700,fontSize:10}}>Grand Total</td>
              <td style={{padding:'8px 10px',textAlign:'right',fontWeight:900,color:'#0F766E',fontFamily:'monospace',fontSize:12}}>$380</td>
            </tr>
          </tfoot>
        </table>
        {/* Bank + Signature */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:14}}>
          <div style={{fontSize:9,color:'#64748b'}}>
            <p style={{fontWeight:700,color:'#1a1a1a',marginBottom:2}}>Bank Details</p>
            <p>Bank: Rimberio &nbsp;|&nbsp; Acc: 0123 4567 8901</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:18,color:'#374151'}}>Claudia</p>
            <div style={{borderTop:'1px solid #1a1a1a',paddingTop:3,fontSize:9,color:'#555'}}>Finance Manager</div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{background:'#0F766E',marginTop:20,padding:'10px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',zIndex:2}}>
        <p style={{color:'rgba(255,255,255,0.85)',fontSize:9,fontStyle:'italic'}}>Thank you for your business!</p>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:8}}>Generated by AutoInvoice</p>
      </div>
    </div>
  )
}

// Template 3 — Circle Studio
function CircleStudioPreview() {
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#fff',fontSize:12,color:'#1a1a1a',minHeight:500,display:'flex',flexDirection:'column'}}>
      {/* Body */}
      <div style={{padding:'24px 28px 0',flex:1}}>
        {/* Centered circle logo */}
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:'50%',border:'2px solid #1a1a1a',display:'inline-flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginBottom:4}}>
            <span style={{fontStyle:'italic',fontSize:8,fontFamily:'Georgia,serif',color:'#555'}}>the</span>
            <span style={{fontWeight:900,fontSize:9,letterSpacing:3}}>CIRCLE</span>
            <span style={{fontSize:6,letterSpacing:2,color:'#9ca3af',textTransform:'uppercase'}}>studio</span>
          </div>
          <p style={{fontSize:9,color:'#9ca3af',letterSpacing:1,textTransform:'uppercase'}}>hello@circlestudio.com</p>
        </div>
        {/* Issued to + Invoice no */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:16}}>
          <div>
            <p style={{fontWeight:700,fontSize:8,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>ISSUED TO:</p>
            <p style={{fontWeight:700,fontSize:11}}>Olivia Smith</p>
            <p style={{color:'#6b7280',fontSize:9}}>Really Great Company</p>
            <p style={{color:'#6b7280',fontSize:9}}>hello@reallygreatsite.com</p>
            <p style={{color:'#6b7280',fontSize:9}}>+1 234 567 8901</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontWeight:700,fontSize:8,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>INVOICE NO:</p>
            <p style={{fontWeight:900,fontSize:20,fontFamily:'monospace'}}>#012345</p>
            <p style={{color:'#6b7280',fontSize:9,marginTop:3}}>12.06.2024</p>
            <p style={{color:'#6b7280',fontSize:9}}>Due: 12.07.2024</p>
          </div>
        </div>
        {/* Table */}
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
          <thead>
            <tr style={{borderTop:'2px solid #1a1a1a',borderBottom:'2px solid #1a1a1a',fontWeight:700,fontSize:8,textTransform:'uppercase',letterSpacing:0.5}}>
              <th style={{padding:'7px 10px',textAlign:'left'}}>Description</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>Unit Price</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>QTY</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {[['Logo Design',200,1,'$200'],['Brand Guide',150,1,'$150'],['Social Kit',100,2,'$200'],['Consultation',80,1,'$80'],['Revisions',60,1,'$60']].map(([d,p,q,t],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'6px 10px'}}>{d}</td>
                <td style={{padding:'6px 10px',textAlign:'right',fontFamily:'monospace'}}>{p}</td>
                <td style={{padding:'6px 10px',textAlign:'right'}}>{q}</td>
                <td style={{padding:'6px 10px',textAlign:'right',fontFamily:'monospace',fontWeight:600}}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Total */}
        <div style={{borderTop:'2px solid #1a1a1a',borderBottom:'2px solid #1a1a1a',padding:'8px 0',display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:11,marginTop:0}}>
          <span>TOTAL</span><span style={{fontFamily:'monospace'}}>$690</span>
        </div>
        {/* Bank + Thank you */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:16}}>
          <div style={{fontSize:9,color:'#6b7280'}}>
            <p style={{fontWeight:700,color:'#1a1a1a',marginBottom:3,fontSize:9}}>BANK DETAILS</p>
            <p>Borcele Bank &nbsp;|&nbsp; Avery Davis</p>
            <p>Acc No.: 123-456-7890</p>
            <p>Pay by: 12 July 2024</p>
          </div>
          <p style={{fontFamily:'Georgia,serif',fontSize:24,fontStyle:'italic',color:'#374151'}}>thank you</p>
        </div>
      </div>
      {/* Footer */}
      <div style={{borderTop:'2px solid #1a1a1a',marginTop:20,padding:'10px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f9fafb'}}>
        <p style={{color:'#6b7280',fontSize:9,fontStyle:'italic'}}>We appreciate your business</p>
        <p style={{color:'#9ca3af',fontSize:8}}>Generated by AutoInvoice</p>
      </div>
    </div>
  )
}

// Template 4 — Aizen Bold
function AizenBoldPreview() {
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#fff',fontSize:12,color:'#1a1a1a',minHeight:500,display:'flex',flexDirection:'column'}}>
      {/* Company header + geometric accents */}
      <div style={{padding:'18px 24px 14px',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',gap:12,background:'#fff',borderBottom:'1px solid #e5e7eb'}}>
        <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderLeft:'56px solid transparent',borderTop:'56px solid #1a1a1a'}} />
        <div style={{position:'absolute',top:0,right:30,width:0,height:0,borderLeft:'28px solid transparent',borderTop:'28px solid #ef4444'}} />
        <div style={{width:36,height:36,background:'#ef4444',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#fff',fontSize:16,flexShrink:0}}>A</div>
        <div>
          <p style={{fontWeight:900,fontSize:13,lineHeight:1.1}}>AIZEN COMPANY</p>
          <p style={{fontSize:8,color:'#9ca3af',letterSpacing:2,textTransform:'uppercase'}}>Creative Agency</p>
        </div>
      </div>
      {/* Centered INVOICE title */}
      <p style={{textAlign:'center',fontWeight:900,fontSize:22,letterSpacing:6,borderBottom:'1px solid #e5e7eb',padding:'10px 0',margin:0}}>INVOICE</p>
      {/* Invoice meta 3 cols */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,padding:'12px 24px',borderBottom:'1px solid #e5e7eb',fontSize:9}}>
        <div>
          <p style={{color:'#9ca3af',marginBottom:2}}>INVOICE TO:</p>
          <p style={{fontWeight:700,fontSize:10}}>DILUC STEINER</p>
          <p style={{color:'#6b7280'}}>456 Corporate Blvd</p>
          <p style={{color:'#6b7280'}}>info@diluc.com</p>
        </div>
        <div>
          <p style={{color:'#9ca3af',marginBottom:2}}>FROM:</p>
          <p style={{fontWeight:700,fontSize:10}}>AIZEN COMPANY</p>
          <p style={{color:'#6b7280'}}>123 Studio Lane</p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{color:'#9ca3af'}}>Date: 12/07/2021</p>
          <p style={{fontFamily:'monospace'}}>INV: 12345678</p>
          <p style={{color:'#6b7280'}}>Due: 11/08/2021</p>
          <p style={{fontWeight:700,color:'#ef4444',marginTop:3}}>USD: $1,500</p>
        </div>
      </div>
      {/* Items table */}
      <div style={{padding:'0 24px',flex:1}}>
        <table style={{width:'100%',borderCollapse:'collapse',marginTop:12,fontSize:10}}>
          <thead>
            <tr style={{background:'#f3f4f6',fontWeight:700,fontSize:9,textTransform:'uppercase',letterSpacing:0.5,color:'#6b7280'}}>
              <th style={{padding:'7px 10px',textAlign:'left'}}>Description</th>
              <th style={{padding:'7px 10px',textAlign:'center'}}>Qty</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>Price</th>
              <th style={{padding:'7px 10px',textAlign:'right'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {[['Brand Identity Design',2,'$120','$240'],['Social Media Package',4,'$100','$400'],['Website Mockup',2,'$120','$240'],['Content Strategy',1,'$380','$380'],['Consultation',3,'$80','$240']].map(([d,q,p,t],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #e5e7eb',background:i%2===0?'#f9fafb':'#fff'}}>
                <td style={{padding:'6px 10px'}}>{d}</td>
                <td style={{padding:'6px 10px',textAlign:'center'}}>{q}</td>
                <td style={{padding:'6px 10px',textAlign:'right',fontFamily:'monospace'}}>{p}</td>
                <td style={{padding:'6px 10px',textAlign:'right',fontFamily:'monospace',fontWeight:700}}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Totals + red badge */}
        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:20,marginTop:10,paddingBottom:12}}>
          <div style={{fontSize:9,color:'#6b7280',textAlign:'right'}}>
            <p>Sub-total: $1,500 &nbsp;|&nbsp; Tax: $0</p>
          </div>
          <div style={{background:'#ef4444',color:'#fff',fontWeight:900,fontSize:11,padding:'8px 16px',borderRadius:4}}>
            Total: $1,500
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{background:'#1a1a1a',padding:'10px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto'}}>
        <p style={{color:'rgba(255,255,255,0.7)',fontSize:9,fontStyle:'italic'}}>Thank you for your business!</p>
        <p style={{color:'rgba(255,255,255,0.4)',fontSize:8}}>Generated by AutoInvoice</p>
      </div>
    </div>
  )
}

// Template 5 — Simple Boxed (Navy Corporate)
function SimpleBoxedPreview() {
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#fff',fontSize:12,color:'#1a1a1a',minHeight:500,display:'flex',flexDirection:'column'}}>
      {/* Navy header */}
      <div style={{background:'#1e2d5b',padding:'20px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{width:32,height:32,background:'#f47321',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#fff',fontSize:15,marginBottom:6}}>B</div>
          <p style={{color:'#fff',fontWeight:700,fontSize:11}}>Your Business</p>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:9}}>Professional Services</p>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:8}}>hello@yourbiz.com</p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{fontWeight:900,fontSize:28,color:'#fff',letterSpacing:3,lineHeight:1}}>INVOICE</p>
          <p style={{fontSize:9,color:'rgba(255,255,255,0.6)',marginTop:5}}>Ref No. INV-2601-001</p>
          <p style={{fontSize:9,color:'rgba(255,255,255,0.6)'}}>Invoice Date: 01 Jan 2025</p>
          <p style={{fontSize:9,color:'#f47321'}}>Due: 31 Jan 2025</p>
        </div>
      </div>
      {/* Company strip */}
      <div style={{background:'#eef1f7',padding:'6px 28px',borderBottom:'1px solid #dce1ed',fontSize:9,color:'#6b7280'}}>
        <span style={{fontWeight:700,color:'#1e2d5b'}}>Your Business</span> &nbsp;|&nbsp; 123 Anywhere St., Any City &nbsp;|&nbsp; GSTIN: 27XXXXX1234
      </div>
      {/* Body */}
      <div style={{padding:'20px 28px',flex:1}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:16,paddingBottom:14,borderBottom:'1px solid #edf0f5'}}>
          <div>
            <p style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#9ca3af',marginBottom:6}}>Billed To</p>
            <p style={{fontWeight:700,fontSize:11,color:'#1e2d5b'}}>Global Corp Ltd.</p>
            <p style={{color:'#6b7280',fontSize:9,marginTop:2}}>456 Corporate Blvd, Metro City</p>
            <p style={{color:'#6b7280',fontSize:9}}>info@globalcorp.com</p>
            <p style={{color:'#6b7280',fontSize:9}}>GSTIN: 29AAACR5055K1ZK</p>
          </div>
          <div>
            <p style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#9ca3af',marginBottom:6}}>Invoice Details</p>
            <table style={{fontSize:9,borderCollapse:'collapse'}}>
              <tbody>
                <tr><td style={{color:'#6b7280',paddingRight:10,paddingBottom:3}}>Invoice No.</td><td style={{fontFamily:'monospace',color:'#1e2d5b',fontWeight:600}}>INV-2601-001</td></tr>
                <tr><td style={{color:'#6b7280',paddingBottom:3}}>Currency</td><td style={{color:'#1e2d5b'}}>INR</td></tr>
                <tr><td style={{color:'#6b7280',paddingBottom:3}}>PO Number</td><td style={{color:'#1e2d5b',fontFamily:'monospace'}}>PO-0042</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Table */}
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
          <thead>
            <tr style={{background:'#1e2d5b'}}>
              <th style={{padding:'8px 8px',textAlign:'center',color:'#fff',fontSize:10,width:30}}>No.</th>
              <th style={{padding:'8px 10px',textAlign:'left',color:'#fff',fontSize:10}}>Description</th>
              <th style={{padding:'8px 10px',textAlign:'center',color:'#fff',fontSize:10}}>Quantity</th>
              <th style={{padding:'8px 10px',textAlign:'right',color:'#fff',fontSize:10}}>Unit Price</th>
              <th style={{padding:'8px 10px',textAlign:'right',color:'#fff',fontSize:10}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {[[1,'Strategy Consulting',1,'₹25,000','₹25,000'],[2,'UI/UX Design',3,'₹5,000','₹15,000'],[3,'Development',2,'₹10,000','₹20,000']].map(([n,d,q,p,a],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #edf0f5',background:i%2===0?'#fff':'#f8f9fb'}}>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#6b7280'}}>{n}</td>
                <td style={{padding:'7px 10px',color:'#1e2d5b',fontWeight:500}}>{d}</td>
                <td style={{padding:'7px 10px',textAlign:'center'}}>{q}</td>
                <td style={{padding:'7px 10px',textAlign:'right',fontFamily:'monospace'}}>{p}</td>
                <td style={{padding:'7px 10px',textAlign:'right',fontFamily:'monospace',fontWeight:700,color:'#1e2d5b'}}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Amount Due badge */}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
          <div style={{background:'#1e2d5b',color:'#fff',fontWeight:900,fontSize:12,padding:'10px 20px',borderRadius:0,display:'flex',gap:20,alignItems:'center'}}>
            <span>Amount Due</span>
            <span style={{fontFamily:'monospace',fontSize:14}}>₹60,000</span>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{background:'#eef1f7',borderTop:'2px solid #1e2d5b',padding:'10px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto'}}>
        <p style={{color:'#6b7280',fontSize:9,fontStyle:'italic'}}>Thank you for your business!</p>
        <p style={{color:'#9ca3af',fontSize:8}}>Generated by AutoInvoice</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function InvoiceTemplatesPage() {
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage(
    "selected-template",
    "clean-teal",
  )
  const [customTemplate] = useLocalStorage("custom-template", null)
  const [importedTemplate, setImportedTemplate] = useLocalStorage("imported-template", null)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [pasteHtml, setPasteHtml] = useState("")
  const [showPasteBox, setShowPasteBox] = useState(false)
  const fileInputRef = useRef(null)

  const handleSelectTemplate = (id) => {
    setSelectedTemplate(id)
    showSuccessToast("Template selected! It will be used for new invoices.")
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
    const isHtml = file.type === "text/html" || file.name.endsWith(".html")
        if (!isPdf && !isHtml) {
      showErrorToast("Please upload a PDF (.pdf) or HTML (.html) file")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (!result) return
      const entry = isPdf
        ? { type: "pdf", dataUrl: result, name: file.name.replace(/\.pdf$/i, ""), savedAt: new Date().toISOString() }
        : { type: "html", html: result, name: file.name.replace(/\.html$/i, ""), savedAt: new Date().toISOString() }
      setImportedTemplate(entry)
      setSelectedTemplate("imported")
      showSuccessToast(`"${file.name}" imported successfully!`)
    }
    if (isPdf) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
    e.target.value = ""
  }

  const handlePasteSubmit = () => {
    const trimmed = pasteHtml.trim()
    if (!trimmed) { showErrorToast("Please paste some HTML first"); return }
    if (!trimmed.includes("<")) { showErrorToast("That doesn't look like valid HTML"); return }
    setImportedTemplate({ html: trimmed, name: "Pasted Template", savedAt: new Date().toISOString() })
    setSelectedTemplate("imported")
    setPasteHtml("")
    setShowPasteBox(false)
    showSuccessToast("Template imported from HTML and activated!")
  }

  const handlePreviewImported = () => {
    if (!importedTemplate) return
    if (importedTemplate.type === "pdf") {
      // Open PDF data URL in new tab — browser renders it natively
      window.open(importedTemplate.dataUrl, "_blank")
    } else {
      const popup = window.open("", "_blank", "width=960,height=720")
      if (!popup) { showErrorToast("Allow popups to preview"); return }
      popup.document.write(importedTemplate.html || "")
      popup.document.close()
      popup.focus()
    }
  }

  const handleDeleteImported = () => {
    setImportedTemplate(null)
    if (selectedTemplate === "imported") setSelectedTemplate("clean-teal")
    showSuccessToast("Imported template removed")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a built-in template — each has a unique design to match your business style
          </p>
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {builtInTemplates.map((tpl) => {
          const PreviewComponent = tpl.preview
          return (
            <Card
              key={tpl.id}
              className={`relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${selectedTemplate === tpl.id
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === tpl.id && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              {/* Mini preview thumbnail */}
              <div className="overflow-hidden border-b bg-muted/20" style={{ maxHeight: 160 }}>
                <div className="scale-[0.48] origin-top-left w-[208%] pointer-events-none select-none">
                  <PreviewComponent />
                </div>
              </div>
              <CardHeader className="pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1.5 ${tpl.cardColor}`}>
                    <tpl.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {tpl.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-[10px] font-normal">
                      {f}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === tpl.id ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    disabled={selectedTemplate === tpl.id}
                  >
                    {selectedTemplate === tpl.id ? "Selected" : "Use This"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom Template Builder */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold mb-4">Custom Template Builder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Saved custom template card — shown only if one exists */}
          {customTemplate && (
            <Card
              className={`relative hover:shadow-lg transition-all duration-200 ${selectedTemplate === "custom"
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === "custom" && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5 bg-primary/10 text-primary">
                    <Pencil className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">Your Custom Template</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Last edited: {new Date(customTemplate.savedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {customTemplate.blocks?.length || 0} blocks
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Custom layout</Badge>
                </div>
                <div className="flex gap-2">
                  <Link to="/template-builder" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === "custom" ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate("custom")}
                    disabled={selectedTemplate === "custom"}
                  >
                    {selectedTemplate === "custom" ? "Selected" : "Use This"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Builder launcher card */}
          <Card className="border-dashed hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-3">
                <Pencil className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">Drag & Drop Builder</h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                Arrange Company Header, Customer Details, Item Table, Signature and more
                into your own layout — then save and use it.
              </p>
              <Link to="/template-builder">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Open Template Builder
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Import Your Own Template ── */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold mb-1">Import Your Own Template</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Have an existing HTML invoice template? Upload the file or paste the HTML directly to use it here.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Saved imported template card */}
          {importedTemplate && (
            <Card
              className={`relative hover:shadow-lg transition-all duration-200 ${selectedTemplate === "imported"
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === "imported" && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5 bg-violet-100 text-violet-700">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{importedTemplate.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      Imported {new Date(importedTemplate.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {importedTemplate.type === "pdf" ? "📄 PDF Template" : "💻 HTML Template"}
                </Badge>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={handlePreviewImported}>
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === "imported" ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate("imported")}
                    disabled={selectedTemplate === "imported"}
                  >
                    {selectedTemplate === "imported" ? "Selected" : "Use This"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive px-2" onClick={handleDeleteImported}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload + paste card */}
          <Card className="border-dashed hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <CardContent className="py-6 px-5 space-y-4">
              <div className="text-center mb-2">
                <div className="rounded-full bg-violet-100 p-3 inline-flex mb-2">
                  <Upload className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold">Import Template File</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a <strong>PDF</strong> or <strong>HTML</strong> file, or paste HTML code
                </p>
              </div>

              {/* File upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.html,application/pdf,text/html"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF or HTML File
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 border-b border-border" />
                <span>or paste HTML</span>
                <div className="flex-1 border-b border-border" />
              </div>

              {/* Paste box toggle */}
              {!showPasteBox ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPasteBox(true)}
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  Paste HTML Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={pasteHtml}
                    onChange={(e) => setPasteHtml(e.target.value)}
                    placeholder="<!DOCTYPE html>\n<html>\n  ...your invoice HTML...\n</html>"
                    className="font-mono text-xs min-h-[120px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setShowPasteBox(false); setPasteHtml("") }} className="flex-1">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handlePasteSubmit} className="flex-1">
                      Import HTML
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} — Full Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (() => {
            const PreviewComp = previewTemplate.preview
            return <PreviewComp />
          })()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleSelectTemplate(previewTemplate.id)
                setPreviewTemplate(null)
              }}
            >
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
