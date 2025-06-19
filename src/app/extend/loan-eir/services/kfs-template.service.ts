import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KfsTemplateService {
  private selectedTemplateId: number = 1; // Default template ID

  constructor(private http: HttpClient) {}

  /**
   * Set the selected template ID
   * @param templateId Template ID to use for generation
   */
  setSelectedTemplateId(templateId: number): void {
    this.selectedTemplateId = templateId;
  }

  /**
   * Get the currently selected template ID
   * @returns Current template ID
   */
  getSelectedTemplateId(): number {
    return this.selectedTemplateId;
  }

  /**
   * Upload KFS template for a loan
   * @param loanId Loan ID
   * @param file Template file
   * @returns Observable<any>
   */
  uploadTemplate(loanId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('templateName', `KFS_Template_${file.name}`);
    formData.append('templateVersion', '1.0');
    formData.append('description', 'Key Fact Sheet Template');

    // Use KFS-specific template upload endpoint
    const url = `/extend/kfs/generation/templates`;

    // Use multipart/form-data for file upload
    const headers = new HttpHeaders();
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data

    return this.http.post(url, formData, { headers });
  }

  /**
   * Check if KFS template exists for a loan
   * @param loanId Loan ID (kept for compatibility but now checks KFS templates globally)
   * @returns Observable<boolean>
   */
  checkTemplateExists(loanId: number): Observable<boolean> {
    // Use KFS-specific templates endpoint
    const url = `/extend/kfs/generation/templates`;

    return this.http.get<any[]>(url).pipe(
      map((templates) => {
        // Check if any active templates exist
        return templates && templates.length > 0 && templates.some((template) => template.isActiveVersion === true);
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Get available KFS templates
   * @returns Observable<any[]>
   */
  getAvailableTemplates(): Observable<any[]> {
    const url = `/extend/kfs/generation/templates`;

    return this.http.get<any[]>(url).pipe(catchError(() => of([])));
  }

  /**
   * Get template format information for tooltip
   * @param loanId Loan ID (kept for compatibility)
   * @returns Observable<string> Template format (always DOCX now)
   */
  getTemplateFormat(loanId: number): Observable<string> {
    const url = `/extend/kfs/generation/templates/format/${loanId}`;

    return this.http.get<{ templateFormat: string }>(url).pipe(
      map((response) => response.templateFormat || 'DOCX'),
      catchError(() => of('DOCX')) // Default to DOCX since we're DOCX-only now
    );
  }

  /**
   * Export KFS document - now DOCX-only with template management
   * @param loanId Loan ID
   * @param format Export format (only DOCX supported)
   * @param eirData EIR calculation data
   * @returns Observable<{blob: Blob, isFallback: boolean}>
   */
  exportKfsDocument(
    loanId: number,
    format: 'PDF' | 'DOCX',
    eirData: any
  ): Observable<{ blob: Blob; isFallback: boolean }> {
    // New docx4j-based generation - checks for custom template first, then uses standard
    return this.generateFromBackendAPI(loanId, 'DOCX', eirData).pipe(
      map((blob) => ({ blob, isFallback: false })),
      catchError((error) => {
        console.warn('Backend KFS generation failed, falling back to RTF generation:', error);
        // Fall back to RTF generation when backend fails
        return this.exportKfsDocumentFallback(loanId, 'DOCX', eirData).pipe(
          map((blob) => ({ blob, isFallback: true }))
        );
      })
    );
  }

  /**
   * Generate document using backend KFS generation API
   * @param loanId Loan ID
   * @param format Export format (DOCX only)
   * @param eirData EIR calculation data
   * @returns Observable<Blob>
   */
  private generateFromBackendAPI(loanId: number, format: 'PDF' | 'DOCX', eirData: any): Observable<Blob> {
    const generationUrl = `/extend/kfs/generation`;

    const generationRequest: any = {
      loanId: loanId,
      // No templateId - backend will check for custom template, then use standard
      deliveryMethod: 'DOWNLOAD'
    };

    // Only include customerName if it has a non-empty value
    if (eirData.customerName && eirData.customerName.trim()) {
      generationRequest.customerName = eirData.customerName.trim();
    }

    // Only include customerMobile if it has a non-empty value
    if (eirData.customerMobile && eirData.customerMobile.trim()) {
      generationRequest.customerMobile = eirData.customerMobile.trim();
    }

    // Only include principalAmount if it's a valid positive number
    if (eirData.principalAmount && eirData.principalAmount > 0) {
      generationRequest.principalAmount = eirData.principalAmount;
    }

    return this.http.post<any>(generationUrl, generationRequest).pipe(
      map((response) => {
        console.log('Backend generation response:', response);

        // Handle case where response is null/undefined
        if (!response) {
          throw new Error('No response received from backend');
        }

        // Check if generation was successful
        if (response.success !== true) {
          throw new Error(`Generation failed: ${response.errorMessage || response.message || 'Unknown error'}`);
        }

        // Backend should return the generated blob content
        if (response.fileContent) {
          try {
            // Decode base64 content from backend
            const binaryString = atob(response.fileContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            // Check if it's DOCX content (ZIP file signature)
            const isDocx =
              bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04; // PK.. (ZIP signature)

            // Check if it's RTF content
            const isRtf = binaryString.startsWith('{\\rtf');

            if (isDocx) {
              console.log('Received proper DOCX content from backend');
              return new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              });
            } else if (isRtf) {
              console.log('Received RTF content from backend (DOCX generation fallback)');
              console.warn('DOCX generation encountered issues, document generated as RTF format instead');
              return new Blob([binaryString], { type: 'application/rtf' });
            } else {
              console.warn('Backend returned unknown format content, treating as text');
              return new Blob([binaryString], { type: 'text/plain' });
            }
          } catch (error) {
            console.error('Error decoding backend response:', error);
            return new Blob([response.fileContent], { type: 'text/plain' });
          }
        } else {
          throw new Error('Backend did not return file content');
        }
      }),
      catchError((error) => {
        console.error('Backend generation failed:', error);
        // Log more details about the error for debugging
        if (error.error) {
          console.error('Error details:', error.error);
        }
        throw error;
      })
    );
  }

  /**
   * Fallback export method that generates a simple document client-side
   * @param loanId Loan ID
   * @param format Export format
   * @param eirData EIR calculation data
   * @returns Observable<Blob>
   */
  private exportKfsDocumentFallback(loanId: number, format: 'PDF' | 'DOCX', eirData: any): Observable<Blob> {
    // Generate a simple text-based document as fallback
    const content = this.generateKfsContent(loanId, eirData);

    let blob: Blob;
    if (format === 'PDF') {
      // Since we can't generate proper PDF without additional libraries,
      // create a rich text file that can be easily converted to PDF
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
      blob = new Blob([rtfContent], { type: 'application/rtf' });
    } else {
      // DOCX - create as RTF for simplicity
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
      blob = new Blob([rtfContent], { type: 'application/rtf' });
    }

    return of(blob);
  }

  /**
   * Generate KFS content text
   * @param loanId Loan ID
   * @param eirData EIR calculation data
   * @returns Generated content string
   */
  private generateKfsContent(loanId: number, eirData: any): string {
    const date = new Date().toLocaleDateString();

    // Extract data from the actual loan data passed from component
    const principalAmount =
      eirData.principalAmount || eirData.principal || (eirData.loanData && eirData.loanData.principal) || 'N/A';

    // Extract BOTH nominal interest rates from the actual loan data
    let annualNominalRate = 'N/A';
    let wholetermNominalRate = 'N/A';

    // Try to get annual nominal rate from various sources
    if (eirData.loanData && eirData.loanData.annualInterestRate) {
      annualNominalRate = eirData.loanData.annualInterestRate;
    } else if (eirData.loanData && eirData.loanData.annual_nominal_interest_rate) {
      annualNominalRate = eirData.loanData.annual_nominal_interest_rate;
    } else if (eirData.annualInterestRate) {
      annualNominalRate = eirData.annualInterestRate;
    } else if (eirData.nominalInterestRate) {
      annualNominalRate = eirData.nominalInterestRate;
    }

    // Try to get whole term rate from various sources
    if (eirData.loanData && eirData.loanData.interestRatePerPeriod) {
      wholetermNominalRate = eirData.loanData.interestRatePerPeriod;
    } else if (eirData.loanData && eirData.loanData.nominal_interest_rate_per_period) {
      wholetermNominalRate = eirData.loanData.nominal_interest_rate_per_period;
    } else if (eirData.interestRatePerPeriod) {
      wholetermNominalRate = eirData.interestRatePerPeriod;
    }

    const effectiveRate = eirData.effectiveInterestRate || 'N/A';
    const tenure =
      eirData.tenureInMonths || eirData.termInMonths || (eirData.loanData && eirData.loanData.termInMonths) || 'N/A';
    const emiAmount = eirData.emiAmount || 'N/A';

    return `KEY FACT SHEET (KFS)
Loan ID: ${loanId}
Generated Date: ${date}

EFFECTIVE INTEREST RATE (EIR) CALCULATION
========================================

Principal Amount: ${principalAmount}
Annual Nominal Interest Rate: ${annualNominalRate}%
Whole Term Nominal Interest Rate: ${wholetermNominalRate}%
Effective Interest Rate: ${effectiveRate}%
Tenure: ${tenure} months
EMI Amount: ${emiAmount}

Calculation Date: ${eirData.calculationDate || date}
Formula Used: ${eirData.formulaUsed || 'IRR'}
Calculation Method: ${eirData.calculationMethod || 'IRR_METHOD'}

This document is generated automatically and may require verification for official use.
`;
  }

  /**
   * Helper method to trigger file download
   * @param blob Blob data
   * @param filename Filename
   */
  downloadFile(blob: Blob, filename: string): void {
    // Adjust filename extension based on actual blob type
    let adjustedFilename = filename;
    if (blob.type === 'application/rtf' && !filename.toLowerCase().endsWith('.rtf')) {
      // Replace .docx extension with .rtf if the content is actually RTF
      adjustedFilename = filename.replace(/\.(docx|doc)$/i, '.rtf');
    } else if (blob.type === 'text/plain' && !filename.toLowerCase().endsWith('.txt')) {
      // Replace extension with .txt if the content is plain text
      adjustedFilename = filename.replace(/\.(docx|doc|rtf)$/i, '.txt');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = adjustedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate filename for KFS document
   * @param loanId Loan ID
   * @param clientName Client name
   * @param format Document format
   * @param isFallback Whether this is a fallback generation
   * @returns Generated filename
   */
  generateFilename(loanId: number, clientName: string, format: 'PDF' | 'DOCX', isFallback: boolean = false): string {
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);

    let extension: string;
    if (isFallback) {
      // For fallback, we generate RTF files regardless of requested format
      extension = '.rtf';
    } else {
      extension = format === 'PDF' ? '.pdf' : '.docx';
    }

    return `KFS_${sanitizedClientName}_Loan${loanId}_${timestamp}${extension}`;
  }

  /**
   * Generate enhanced KFS content text with template indication
   * @param loanId Loan ID
   * @param eirData EIR calculation data
   * @param response Generation response (optional)
   * @returns Generated content string
   */
  private generateEnhancedKfsContent(loanId: number, eirData: any, response?: any): string {
    const date = new Date().toLocaleDateString();

    // Extract loan data if available - try multiple sources for the nominal interest rate
    const principalAmount = eirData.principalAmount || eirData.principal || 'N/A';

    // Try to get nominal rate from multiple possible sources
    let nominalRate = 'N/A';
    if (eirData.nominalInterestRate) {
      nominalRate = eirData.nominalInterestRate;
    } else if (eirData.interestRatePerPeriod) {
      nominalRate = eirData.interestRatePerPeriod;
    } else if (eirData.annualInterestRate) {
      nominalRate = eirData.annualInterestRate;
    } else if (eirData.loanData && eirData.loanData.annualInterestRate) {
      nominalRate = eirData.loanData.annualInterestRate;
    } else if (eirData.loanData && eirData.loanData.interestRatePerPeriod) {
      nominalRate = eirData.loanData.interestRatePerPeriod;
    }

    const effectiveRate = eirData.effectiveInterestRate || 'N/A';
    const tenure = eirData.tenureInMonths || eirData.termInMonths || 'N/A';
    const emiAmount = eirData.emiAmount || 'N/A';

    // Include response information if available
    const documentRef = response?.documentReferenceNumber || 'N/A';
    const generationStatus = response?.generationStatus || 'COMPLETED';

    return `KEY FACT SHEET (KFS) - GENERATED FROM BACKEND TEMPLATE

Document Reference: ${documentRef}
Loan ID: ${loanId}
Generated Date: ${date}
Generation Status: ${generationStatus}

EFFECTIVE INTEREST RATE (EIR) CALCULATION
========================================

Principal Amount: ${principalAmount}
Interest Rate: ${nominalRate}%
Effective Interest Rate: ${effectiveRate}%
Tenure: ${tenure} months
EMI Amount: ${emiAmount}

This document was generated using the backend KFS generation system.
Template processing completed successfully.

Calculation Date: ${eirData.calculationDate || date}
Formula Used: ${eirData.formulaUsed || 'IRR'}
Calculation Method: ${eirData.calculationMethod || 'IRR_METHOD'}

This document is generated using your uploaded template and may require verification for official use.
`;
  }
}
