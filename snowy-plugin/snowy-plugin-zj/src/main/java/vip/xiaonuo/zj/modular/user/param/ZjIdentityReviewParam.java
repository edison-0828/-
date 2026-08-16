package vip.xiaonuo.zj.modular.user.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZjIdentityReviewParam {
    @NotBlank(message = "用户ID不能为空")
    private String userId;
    @NotBlank(message = "审核结果不能为空")
    private String status;
    private String remark;
}
