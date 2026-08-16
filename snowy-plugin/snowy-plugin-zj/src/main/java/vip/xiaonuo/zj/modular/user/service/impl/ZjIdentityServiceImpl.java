package vip.xiaonuo.zj.modular.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import vip.xiaonuo.auth.core.util.StpClientUtil;
import vip.xiaonuo.common.exception.CommonException;
import vip.xiaonuo.common.util.CommonCryptogramUtil;
import vip.xiaonuo.zj.modular.user.entity.ZjUserProfile;
import vip.xiaonuo.zj.modular.user.mapper.ZjUserProfileMapper;
import vip.xiaonuo.zj.modular.user.param.ZjIdentityReviewParam;
import vip.xiaonuo.zj.modular.user.param.ZjIdentitySubmitParam;
import vip.xiaonuo.zj.modular.user.service.ZjIdentityService;

import java.util.Set;

@Service
public class ZjIdentityServiceImpl extends ServiceImpl<ZjUserProfileMapper, ZjUserProfile> implements ZjIdentityService {
    private static final String VERIFIED = "VERIFIED";

    @Override
    public ZjUserProfile current() {
        String userId = StpClientUtil.getLoginIdAsString();
        ZjUserProfile profile = findByUserId(userId);
        if (profile != null) return profile;
        ZjUserProfile empty = new ZjUserProfile();
        empty.setUserId(userId);
        empty.setIdentityStatus("UNVERIFIED");
        return empty;
    }

    @Override
    public void submit(ZjIdentitySubmitParam param) {
        String userId = StpClientUtil.getLoginIdAsString();
        ZjUserProfile profile = findByUserId(userId);
        if (profile == null) {
            profile = new ZjUserProfile();
            profile.setUserId(userId);
        }
        profile.setRealName(param.getRealName().trim());
        profile.setIdCardCiphertext(CommonCryptogramUtil.doSm4CbcEncrypt(param.getIdCardNumber().toUpperCase()));
        profile.setIdentityFrontUrl(param.getIdentityFrontUrl());
        profile.setIdentityBackUrl(param.getIdentityBackUrl());
        profile.setIdentityStatus("PENDING_REVIEW");
        profile.setReviewRemark(null);
        this.saveOrUpdate(profile);
    }

    @Override
    public boolean isCurrentUserVerified() {
        ZjUserProfile profile = findByUserId(StpClientUtil.getLoginIdAsString());
        return profile != null && VERIFIED.equals(profile.getIdentityStatus());
    }

    @Override
    public void review(ZjIdentityReviewParam param) {
        String status = param.getStatus().toUpperCase();
        if (!Set.of(VERIFIED, "REJECTED").contains(status)) {
            throw new CommonException("审核结果只能是VERIFIED或REJECTED");
        }
        ZjUserProfile profile = findByUserId(param.getUserId());
        if (profile == null) throw new CommonException("实名认证申请不存在");
        profile.setIdentityStatus(status);
        profile.setReviewRemark(param.getRemark());
        this.updateById(profile);
    }

    private ZjUserProfile findByUserId(String userId) {
        return this.getOne(new LambdaQueryWrapper<ZjUserProfile>().eq(ZjUserProfile::getUserId, userId));
    }
}
