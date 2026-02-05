const contractAddress = "0x7FC5bd18A94C72cB8ce8cE1464DEd8cA06dA0641";
const clankerLink = "https://clanker.world/clanker/" + contractAddress;
const ctaButton = document.querySelector('.cta-button');

if (ctaButton) {
    ctaButton.innerHTML = `
        <div class="description">
                <p style="text-align: center; color: rgba(255, 255, 255, 0.7);">
                    Trade on Clanker 🛓
                </p>
            </div>
            <a href="${clankerLink}" class="cta-button" target="_blank">
                Trade on Clanker
            </a>
        <div class="contract-box">
            <div class="contract-label">Contract Address:</div>
            <div class="contract-address">${contractAddress}</div>
            <div class="copy-hint">Click to copy</div>
        </div>
    `;
    
    // Add copy functionality
    const script = document.createElement('script');
    script.innerHTML = `
        const contractAddress = "${contractAddress}";
        
        document.addEventListener('DOMContentLoaded', function() {
            const contractBox = document.querySelector('.contract-box');
            
            if (contractBox) {
                contractBox.addEventListener('click', function() {
                    navigator.clipboard.writeText(contractAddress);
                        
                        const addressElement = document.querySelector('.contract-address');
                        const hintElement = document.querySelector('.copy-hint');
                        
                        addressElement.textContent = 'Copied!';
                        hintElement.textContent = '';
                        
                        setTimeout(function() {
                            addressElement.textContent = contractAddress;
                        }, 2000);
                });
            }
        });
    </script>
    `;
    
    document.head.appendChild(script);
}