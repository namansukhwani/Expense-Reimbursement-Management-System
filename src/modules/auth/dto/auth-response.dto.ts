import { UserRole } from '../../../common/enums/user-role.enum';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId: string | null;
    reportingManagerId: string | null;
  };
}
