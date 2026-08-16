package vip.xiaonuo.zj.modular.listing.param;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ZjListingCreateParam {
    @NotBlank(message = "标题不能为空")
    @Size(max = 120, message = "标题不能超过120字")
    private String title;
    @NotBlank(message = "城市不能为空")
    private String city;
    @NotBlank(message = "区域不能为空")
    private String district;
    @NotBlank(message = "小区不能为空")
    private String community;
    @NotNull(message = "租金不能为空")
    @Positive(message = "租金必须大于0")
    private Long monthlyRentCents;
    @NotNull(message = "可入住时间不能为空")
    @FutureOrPresent(message = "可入住时间不能早于今天")
    private LocalDate availableFrom;
    @NotNull(message = "租约到期时间不能为空")
    private LocalDate leaseEndsAt;
    @Size(max = 2000, message = "描述不能超过2000字")
    private String description;
    @Size(max = 8, message = "房源图片最多8张")
    private List<@NotBlank(message = "图片地址不能为空") String> imageUrls;
}
