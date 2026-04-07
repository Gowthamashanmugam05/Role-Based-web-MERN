from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_resume(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "Gowthama Shanmugam V")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 80, "AI / ML Engineer & Full Stack Developer")
    
    c.setFont("Helvetica", 11)
    c.drawString(50, height - 100, "Chennai, Tamil Nadu | gowtham@example.com")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 130, "Technical Skills")
    c.setFont("Helvetica", 11)
    c.drawString(50, height - 145, "Python, TensorFlow, PyTorch, React, Node.js, Express, MongoDB, AWS")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 175, "Experience")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 190, "AI Developer Intern | Tech Solutions")
    c.setFont("Helvetica", 11)
    c.drawString(50, height - 205, "Worked on RAG-based AI applications and neural networks.")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 235, "Projects")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 250, "AI Job Matcher")
    c.setFont("Helvetica", 11)
    c.drawString(50, height - 265, "A premium platform that simulates a senior hiring manager panel for career insights.")
    
    c.save()

if __name__ == "__main__":
    create_resume("test_resume.pdf")
    print("Test resume created successfully: test_resume.pdf")
