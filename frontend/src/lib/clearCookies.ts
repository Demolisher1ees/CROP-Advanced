export function clearAllCookies() {
  // Get all cookies
  const cookies = document.cookie.split(";")

  // Clear each cookie
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
    
    // Delete cookie for current domain
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    
    // Delete cookie for root domain
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
    
    // Delete cookie for parent domain (if subdomain)
    const domain = window.location.hostname.split('.').slice(-2).join('.')
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + domain
  }

  // Clear localStorage
  localStorage.clear()
  
  // Clear sessionStorage
  sessionStorage.clear()

  console.log("All cookies and storage cleared")
}
