const LOCATION_HOST = 'ec2-16-171-45-77.eu-north-1.compute.amazonaws.com'

export const IS_DEBUG = window.location.host !== `${LOCATION_HOST}:3000`

export const ENDPOINT = IS_DEBUG ? 'http://localhost:8000/' : `http://${LOCATION_HOST}:8000/`

export const VK_ACCESS_TOKEN = 'dfc81daadfc81daadfc81daa51dfba9a4cddfc8dfc81daa812a9735657f3387f235945d'
