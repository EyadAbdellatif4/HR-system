import { User } from '../../users/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { Title } from '../../titles/entities/title.entity';
import { Phone } from '../../phones/entities/phone.entity';
import { Department } from '../../departments/entities/department.entity';
import { UserDepartment } from './entities/user-department.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { AssetTracking } from '../../asset-tracking/entities/asset-tracking.entity';

export default () => {
  return [User, Role, Title, Phone, Department, UserDepartment, Asset, AssetTracking];
};
