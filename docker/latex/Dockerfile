FROM texlive/texlive:latest

WORKDIR /workspace

# Install additional LaTeX packages if needed
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for PDF processing
RUN pip3 install pypdf reportlab --no-cache-dir --break-system-packages

# Create directories
RUN mkdir -p /workspace/latex /workspace/temp

# Set working directory
WORKDIR /workspace

# Default command
CMD ["/bin/bash"]
