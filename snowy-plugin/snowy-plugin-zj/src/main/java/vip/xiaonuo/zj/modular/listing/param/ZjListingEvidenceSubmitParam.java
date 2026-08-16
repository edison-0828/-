package vip.xiaonuo.zj.modular.listing.param;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ZjListingEvidenceSubmitParam {
    @NotBlank(message = "房源ID不能为空")
    private String listingId;
    @NotEmpty(message = "请上传租赁合同")
    @Size(max = 8, message = "合同文件最多8份")
    private List<@NotBlank String> contractUrls;
    @Size(max = 6, message = "租金证明最多6份")
    private List<@NotBlank String> rentProofUrls;
}
