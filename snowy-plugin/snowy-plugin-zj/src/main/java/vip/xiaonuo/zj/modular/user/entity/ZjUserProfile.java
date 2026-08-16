package vip.xiaonuo.zj.modular.user.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import vip.xiaonuo.common.pojo.CommonEntity;

@Getter
@Setter
@TableName("ZJ_USER_PROFILE")
public class ZjUserProfile extends CommonEntity {
    @TableId
    private String id;
    private String userId;
    private String identityStatus;
    private String realName;
    @JsonIgnore
    private String idCardCiphertext;
    private String identityFrontUrl;
    private String identityBackUrl;
    private String reviewRemark;
}
