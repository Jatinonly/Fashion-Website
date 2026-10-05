import { Link } from 'react-router-dom'
import { buttonClasses } from './buttonStyles'

export function ButtonLink({ variant, size, fullWidth, className, ...props }) {
  return <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props} />
}
