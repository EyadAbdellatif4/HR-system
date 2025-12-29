import { User } from '../../users/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { Department } from '../../departments/entities/department.entity';
import { UserDepartment } from './entities/user-department.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { AssetTracking } from '../../asset-tracking/entities/asset-tracking.entity';
import { Image } from './entities/image.entity';

export default () => {
  return [User, Role, Department, UserDepartment, Asset, AssetTracking, Image];
};
