package vip.xiaonuo.zj.modular.listing.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZjListingReviewParam {
    @NotBlank(message = "房源ID不能为空")
    private String listingId;
    @NotBlank(message = "审核结果不能为空")
    private String status;
    private String remark;
}
