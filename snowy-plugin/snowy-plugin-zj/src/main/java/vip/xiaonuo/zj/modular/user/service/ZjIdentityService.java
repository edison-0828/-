package vip.xiaonuo.zj.modular.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import vip.xiaonuo.zj.modular.user.entity.ZjUserProfile;
import vip.xiaonuo.zj.modular.user.param.ZjIdentityReviewParam;
import vip.xiaonuo.zj.modular.user.param.ZjIdentitySubmitParam;

public interface ZjIdentityService extends IService<ZjUserProfile> {
    ZjUserProfile current();
    void submit(ZjIdentitySubmitParam param);
    boolean isCurrentUserVerified();
    void review(ZjIdentityReviewParam param);
}
